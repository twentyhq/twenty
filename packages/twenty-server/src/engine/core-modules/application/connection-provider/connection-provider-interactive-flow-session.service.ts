import { Injectable } from '@nestjs/common';

import { randomUUID } from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { INTERACTIVE_CONNECTION_LIMITS } from 'src/engine/core-modules/application/connection-provider/constants/interactive-connection-limits.constant';
import { type InteractiveConnectionFlowSession } from 'src/engine/core-modules/application/connection-provider/types/interactive-connection-flow-session.type';
import { InjectCacheStorage } from 'src/engine/core-modules/cache-storage/decorators/cache-storage.decorator';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

const buildSessionCacheKey = (flowId: string): string =>
  `connection-provider-interactive-flow:${flowId}`;

@Injectable()
export class ConnectionProviderInteractiveFlowSessionService {
  constructor(
    @InjectCacheStorage(CacheStorageNamespace.EngineAuthSession)
    private readonly cacheStorage: CacheStorageService,
  ) {}

  async create(session: InteractiveConnectionFlowSession): Promise<string> {
    const flowId = randomUUID();

    await this.save({ flowId, session });

    return flowId;
  }

  async save({
    flowId,
    session,
  }: {
    flowId: string;
    session: InteractiveConnectionFlowSession;
  }): Promise<void> {
    await this.cacheStorage.set(
      buildSessionCacheKey(flowId),
      session,
      INTERACTIVE_CONNECTION_LIMITS.flowTtlMilliseconds,
    );
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
