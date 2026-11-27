import { Injectable, Logger } from '@nestjs/common';

import { type InteractiveConnectionStepResult } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderConnectedAccountService } from 'src/engine/core-modules/application/connection-provider/connection-provider-connected-account.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderInteractiveFlowSessionService } from 'src/engine/core-modules/application/connection-provider/connection-provider-interactive-flow-session.service';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
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
import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';

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

      if (!isDefined(flowId)) {
        return {
          status: 'IN_PROGRESS',
          flowId: await this.sessionService.create(nextSession),
          screen: stepResult.screen,
        };
      }

      await this.sessionService.save({ flowId, session: nextSession });

      return { status: 'IN_PROGRESS', flowId, screen: stepResult.screen };
    }

    if (isDefined(flowId)) {
      await this.sessionService.delete(flowId);
    }

    if (stepResult.type === 'cancelled') {
      return { status: 'CANCELLED' };
    }

    const connectedAccountId = await this.persistConnectedAccount({
      provider,
      session,
      stepResult,
    });

    return { status: 'CONNECTED', connectedAccountId };
  }

  private async persistConnectedAccount({
    provider,
    session,
    stepResult: { externalAccountId, handle, accessToken },
  }: {
    provider: InteractiveConnectionProvider;
    session: InteractiveConnectionFlowSession;
    stepResult: Extract<InteractiveConnectionStepResult, { type: 'done' }>;
  }): Promise<string> {
    const existingConnectedAccount =
      await this.connectedAccountService.findConnectedAccountForReport({
        provider,
        workspaceId: session.workspaceId,
        userWorkspaceId: session.userWorkspaceId,
        externalAccountId,
        reconnectingConnectedAccountId: session.reconnectingConnectedAccountId,
      });

    const connectedAccount = await this.connectedAccountService.persist({
      provider,
      credentials: isDefined(accessToken)
        ? {
            accessToken: plaintextStringSchema.parse(accessToken),
            refreshToken: null,
            scopes: null,
          }
        : undefined,
      handle,
      identifiedAccount: { externalAccountId },
      workspaceId: session.workspaceId,
      userId: session.userId,
      userWorkspaceId: session.userWorkspaceId,
      scope: session.scope,
      reconnectingConnectedAccountId:
        session.reconnectingConnectedAccountId ??
        existingConnectedAccount?.id ??
        null,
    });

    const isAlreadyActiveAccount =
      !isDefined(session.reconnectingConnectedAccountId) &&
      isDefined(existingConnectedAccount) &&
      !isDefined(existingConnectedAccount.archivedAt) &&
      !isDefined(existingConnectedAccount.authFailedAt);

    if (!isAlreadyActiveAccount) {
      await this.connectionProviderLifecycleHookService.dispatchOnConnect({
        provider,
        workspaceId: session.workspaceId,
        connectedAccountId: connectedAccount.id,
      });
    }

    return connectedAccount.id;
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
