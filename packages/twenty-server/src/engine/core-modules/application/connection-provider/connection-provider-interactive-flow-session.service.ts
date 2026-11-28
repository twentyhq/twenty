import { Injectable } from '@nestjs/common';

import { randomUUID } from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { INTERACTIVE_CONNECTION_LIMITS } from 'src/engine/core-modules/application/connection-provider/constants/interactive-connection-limits.constant';
import { type InteractiveConnectionReportedAccount } from 'src/engine/core-modules/application/connection-provider/types/interactive-connection-reported-account.type';
import { type InteractiveConnectionFlowSession } from 'src/engine/core-modules/application/connection-provider/types/interactive-connection-flow-session.type';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';
import {
  type PlaintextString,
  plaintextStringSchema,
} from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';

const buildSessionCacheKey = (flowId: string): string =>
  `connection-provider-interactive-flow:${flowId}`;

@Injectable()
export class ConnectionProviderInteractiveFlowSessionService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineAuthSession)
    private readonly cacheStorage: CacheStorageService,
    private readonly connectedAccountTokenEncryptionService: ConnectedAccountTokenEncryptionService,
  ) {}

  async upsert({
    flowId,
    session,
  }: {
    flowId: string | null;
    session: InteractiveConnectionFlowSession;
  }): Promise<string> {
    const savedFlowId = flowId ?? randomUUID();

    await this.cacheStorage.set(
      buildSessionCacheKey(savedFlowId),
      session,
      INTERACTIVE_CONNECTION_LIMITS.flowTtlMilliseconds,
    );

    return savedFlowId;
  }

  toPendingCompletion({
    reportedAccount: { externalAccountId, handle, accessToken },
    workspaceId,
  }: {
    reportedAccount: InteractiveConnectionReportedAccount;
    workspaceId: string;
  }): NonNullable<InteractiveConnectionFlowSession['pendingCompletion']> {
    return {
      externalAccountId,
      handle: handle ?? null,
      encryptedAccessToken: isDefined(accessToken)
        ? this.connectedAccountTokenEncryptionService.encrypt({
            plaintext: plaintextStringSchema.parse(accessToken),
            workspaceId,
          })
        : null,
    };
  }

  fromPendingCompletion({
    pendingCompletion: { externalAccountId, handle, encryptedAccessToken },
    workspaceId,
  }: {
    pendingCompletion: NonNullable<
      InteractiveConnectionFlowSession['pendingCompletion']
    >;
    workspaceId: string;
  }): {
    externalAccountId: string;
    handle?: string;
    accessToken?: PlaintextString;
  } {
    return {
      externalAccountId,
      ...(isDefined(handle) && { handle }),
      ...(isDefined(encryptedAccessToken) && {
        accessToken: this.connectedAccountTokenEncryptionService.decrypt({
          ciphertext: encryptedAccessToken,
          workspaceId,
        }),
      }),
    };
  }

  async findOrThrow({
    flowId,
    workspaceId,
    userWorkspaceId,
  }: {
    flowId: string;
    workspaceId: string;
    userWorkspaceId: string;
  }): Promise<InteractiveConnectionFlowSession> {
    const session =
      await this.cacheStorage.get<InteractiveConnectionFlowSession>(
        buildSessionCacheKey(flowId),
      );

    if (
      !isDefined(session) ||
      session.workspaceId !== workspaceId ||
      session.userWorkspaceId !== userWorkspaceId ||
      Date.now() - session.createdAtMs >
        INTERACTIVE_CONNECTION_LIMITS.flowTtlMilliseconds
    ) {
      throw new ConnectionProviderException(
        `Interactive connection flow ${flowId} expired or belongs to another member`,
        ConnectionProviderExceptionCode.INTERACTIVE_CONNECTION_EXPIRED,
      );
    }

    return session;
  }

  async delete(flowId: string): Promise<void> {
    await this.cacheStorage.del(buildSessionCacheKey(flowId));
  }
}
