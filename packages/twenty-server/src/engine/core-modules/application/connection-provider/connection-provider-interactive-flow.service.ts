import { Injectable, Logger } from '@nestjs/common';

import { type InteractiveConnectionStepResult } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderConnectedAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-connected-account.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderInteractiveFlowSessionService } from 'src/engine/core-modules/application/connection-provider/connection-provider-interactive-flow-session.service';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { ConnectionProviderReportedAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-reported-account.service';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import { type InteractiveConnectionAction } from 'src/engine/core-modules/application/connection-provider/types/interactive-connection-action.type';
import { type InteractiveConnectionFlowSession } from 'src/engine/core-modules/application/connection-provider/types/interactive-connection-flow-session.type';
import { type InteractiveConnectionStepOutcome } from 'src/engine/core-modules/application/connection-provider/types/interactive-connection-step-outcome.type';
import {
  assertInteractiveProvider,
  type InteractiveConnectionProvider,
} from 'src/engine/core-modules/application/connection-provider/utils/assert-interactive-provider.util';
import { readInteractiveConnectionStepValuesOrThrow } from 'src/engine/core-modules/application/connection-provider/utils/read-interactive-connection-step-values-or-throw.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';

const FLOW_LOCK_OPTIONS = { ttl: 15_000, maxRetries: 150 };

@Injectable()
export class ConnectionProviderInteractiveFlowService {
  private readonly logger = new Logger(
    ConnectionProviderInteractiveFlowService.name,
  );

  constructor(
    private readonly connectionProviderService: ConnectionProviderService,
    private readonly connectedAccountService: ConnectionProviderConnectedAccountService,
    private readonly connectionProviderLifecycleHookService: ConnectionProviderLifecycleHookService,
    private readonly reportedAccountService: ConnectionProviderReportedAccountService,
    private readonly sessionService: ConnectionProviderInteractiveFlowSessionService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async start({
    applicationId,
    providerName,
    workspaceId,
    userId,
    userWorkspaceId,
    reconnectingConnectedAccountId,
    locale,
  }: {
    applicationId: string;
    providerName: string;
    workspaceId: string;
    userId: string;
    userWorkspaceId: string;
    reconnectingConnectedAccountId: string | null;
    locale: string;
  }): Promise<InteractiveConnectionStepOutcome> {
    const provider =
      await this.connectionProviderService.findOneByApplicationAndName({
        applicationId,
        name: providerName,
        workspaceId,
      });

    if (!isDefined(provider)) {
      throw new ConnectionProviderException(
        `Connection provider "${providerName}" not found for application ${applicationId}`,
        ConnectionProviderExceptionCode.PROVIDER_NOT_FOUND,
      );
    }

    assertInteractiveProvider(provider);

    await this.connectedAccountService.assertCallerCanConnectOrThrow({
      connectionProviderId: provider.id,
      workspaceId,
      userWorkspaceId,
      scope: provider.scope,
      reconnectingConnectedAccountId,
    });

    const stepResult =
      await this.connectionProviderLifecycleHookService.runStep({
        provider,
        workspaceId,
        payload: { trigger: 'start', state: null, values: {}, locale },
      });

    return this.handleStepResult({
      provider,
      flowId: null,
      session: {
        connectionProviderId: provider.id,
        workspaceId,
        userId,
        userWorkspaceId,
        scope: provider.scope,
        reconnectingConnectedAccountId,
        createdAtMs: Date.now(),
        submitCount: 0,
        screenType: 'form',
        fieldKeys: [],
        state: {},
        pendingCompletion: null,
      },
      stepResult,
    });
  }

  async continue({
    flowId,
    action,
    values,
    workspaceId,
    userWorkspaceId,
    locale,
  }: {
    flowId: string;
    action: InteractiveConnectionAction;
    values: Record<string, unknown>;
    workspaceId: string;
    userWorkspaceId: string;
    locale: string;
  }): Promise<InteractiveConnectionStepOutcome> {
    return this.cacheLockService.withLock(
      async () => {
        const session = await this.sessionService.findOrThrow({
          flowId,
          workspaceId,
          userWorkspaceId,
        });

        const provider =
          await this.connectionProviderService.findOneByIdOrThrow({
            id: session.connectionProviderId,
            workspaceId,
          });

        assertInteractiveProvider(provider);

        if (action === 'cancel') {
          return this.cancel({ provider, flowId, session, locale });
        }

        await this.connectedAccountService.assertCallerCanConnectOrThrow({
          connectionProviderId: provider.id,
          workspaceId,
          userWorkspaceId,
          scope: session.scope,
          reconnectingConnectedAccountId:
            session.reconnectingConnectedAccountId,
        });

        if (isDefined(session.pendingCompletion)) {
          return this.complete({
            provider,
            flowId,
            session,
            pendingCompletion: session.pendingCompletion,
          });
        }

        const stepResult =
          await this.connectionProviderLifecycleHookService.runStep({
            provider,
            workspaceId,
            payload: {
              trigger: action,
              state: session.state,
              values: readInteractiveConnectionStepValuesOrThrow({
                action,
                session,
                values,
              }),
              locale,
            },
          });

        return this.handleStepResult({
          provider,
          flowId,
          session: {
            ...session,
            submitCount: session.submitCount + (action === 'submit' ? 1 : 0),
          },
          stepResult,
        });
      },
      `connection-provider-interactive-flow-lock:${flowId}`,
      FLOW_LOCK_OPTIONS,
    );
  }

  private async handleStepResult({
    provider,
    flowId,
    session,
    stepResult,
  }: {
    provider: InteractiveConnectionProvider;
    flowId: string | null;
    session: InteractiveConnectionFlowSession;
    stepResult: InteractiveConnectionStepResult;
  }): Promise<InteractiveConnectionStepOutcome> {
    if (stepResult.type === 'screen') {
      const nextSession: InteractiveConnectionFlowSession = {
        ...session,
        screenType: stepResult.screen.type,
        fieldKeys:
          stepResult.screen.type === 'form'
            ? stepResult.screen.fields.map((field) => field.key)
            : [],
        state: stepResult.state,
      };

      return {
        status: 'IN_PROGRESS',
        flowId: await this.sessionService.upsert({
          flowId,
          session: nextSession,
        }),
        screen: stepResult.screen,
      };
    }

    if (stepResult.type === 'cancelled') {
      if (isDefined(flowId)) {
        await this.sessionService.delete(flowId);
      }

      return { status: 'CANCELLED' };
    }

    const pendingCompletion = this.sessionService.toPendingCompletion({
      reportedAccount: stepResult,
      workspaceId: session.workspaceId,
    });

    const completingFlowId = await this.sessionService.upsert({
      flowId,
      session: { ...session, pendingCompletion },
    });

    return this.complete({
      provider,
      flowId: completingFlowId,
      session,
      pendingCompletion,
    });
  }

  // The session keeps the done result until persistence succeeds, so a failed attempt can be retried without signing in again.
  private async complete({
    provider,
    flowId,
    session,
    pendingCompletion,
  }: {
    provider: InteractiveConnectionProvider;
    flowId: string;
    session: InteractiveConnectionFlowSession;
    pendingCompletion: NonNullable<
      InteractiveConnectionFlowSession['pendingCompletion']
    >;
  }): Promise<InteractiveConnectionStepOutcome> {
    const connectedAccountId =
      await this.reportedAccountService.persistReportedAccount({
        provider,
        workspaceId: session.workspaceId,
        userId: session.userId,
        userWorkspaceId: session.userWorkspaceId,
        scope: session.scope,
        reconnectingConnectedAccountId: session.reconnectingConnectedAccountId,
        authorizationIssuedAtSeconds: Math.floor(session.createdAtMs / 1000),
        reportedAccount: this.sessionService.fromPendingCompletion({
          pendingCompletion,
          workspaceId: session.workspaceId,
        }),
      });

    await this.sessionService.delete(flowId);

    if (!isDefined(connectedAccountId)) {
      throw new ConnectionProviderException(
        `Interactive connection flow ${flowId} started before account ${pendingCompletion.externalAccountId} was disconnected`,
        ConnectionProviderExceptionCode.INTERACTIVE_CONNECTION_EXPIRED,
      );
    }

    return { status: 'CONNECTED', connectedAccountId };
  }

  // The member is leaving either way, so a failing cancel hook must not keep the flow alive.
  private async cancel({
    provider,
    flowId,
    session,
    locale,
  }: {
    provider: InteractiveConnectionProvider;
    flowId: string;
    session: InteractiveConnectionFlowSession;
    locale: string;
  }): Promise<InteractiveConnectionStepOutcome> {
    await this.sessionService.delete(flowId);

    try {
      await this.connectionProviderLifecycleHookService.runStep({
        provider,
        workspaceId: session.workspaceId,
        payload: {
          trigger: 'cancel',
          state: session.state,
          values: {},
          locale,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Cancel step of connection provider ${provider.id} failed (workspaceId=${session.workspaceId}): ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    return { status: 'CANCELLED' };
  }
}
