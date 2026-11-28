import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import { fromHealthCheckDataToResultDto } from 'src/engine/core-modules/application/application-health/utils/from-health-check-data-to-result-dto.util';
import { AppConnectionAccessService } from 'src/engine/core-modules/application/connection-provider/app-connection-access.service';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderLifecycleHookService } from 'src/engine/core-modules/application/connection-provider/connection-provider-lifecycle-hook.service';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { ConnectionProviderService } from 'src/engine/core-modules/application/connection-provider/connection-provider.service';
import {
  CONNECTION_CHECK_RATE_LIMIT_MAX,
  CONNECTION_CHECK_RATE_LIMIT_WINDOW_MS,
} from 'src/engine/core-modules/application/connection-provider/constants/connection-check-rate-limit.constant';
import { restrictConnectionCheckActionToProvider } from 'src/engine/core-modules/application/connection-provider/utils/restrict-connection-check-action-to-provider.util';
import { type ApplicationHealthCheckResultDTO } from 'src/engine/core-modules/application/dtos/application-health-check-result.dto';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { buildConnectedAccountUsableByCallerWhere } from 'src/engine/metadata-modules/connected-account/utils/build-connected-account-usable-by-caller-where.util';

@Injectable()
export class ConnectionCheckService {
  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    private readonly connectionProviderService: ConnectionProviderService,
    private readonly appConnectionAccessService: AppConnectionAccessService,
    private readonly connectionProviderLifecycleHookService: ConnectionProviderLifecycleHookService,
    private readonly throttlerService: ThrottlerService,
  ) {}

  async run({
    connectedAccountId,
    workspaceId,
    userId,
    userWorkspaceId,
  }: {
    connectedAccountId: string;
    workspaceId: string;
    userId: string;
    userWorkspaceId: string;
  }): Promise<ApplicationHealthCheckResultDTO | null> {
    const connectedAccount = await this.connectedAccountRepository.findOne({
      where: buildConnectedAccountUsableByCallerWhere({
        baseWhere: {
          id: connectedAccountId,
          workspaceId,
          archivedAt: IsNull(),
        },
        userWorkspaceId,
      }),
    });

    if (
      !isDefined(connectedAccount) ||
      !isDefined(connectedAccount.connectionProviderId)
    ) {
      throw new ConnectionProviderException(
        `Connection ${connectedAccountId} not found`,
        ConnectionProviderExceptionCode.CONNECTION_NOT_FOUND,
      );
    }

    await this.appConnectionAccessService.validateCallerCanManageConnection({
      isWorkspaceShared: connectedAccount.scope === 'WORKSPACE',
      workspaceId,
      userWorkspaceId,
    });

    // A connection that needs reconnecting already says so; checking it would only fail.
    if (isDefined(connectedAccount.authFailedAt)) {
      return null;
    }

    const provider = await this.connectionProviderService.findOneByIdOrThrow({
      id: connectedAccount.connectionProviderId,
      workspaceId,
    });

    if (!isDefined(provider.checkConnectionLogicFunctionUniversalIdentifier)) {
      return null;
    }

    await this.throttlerService.tokenBucketThrottleOrThrow(
      `connection-check:${workspaceId}:${userWorkspaceId}:${connectedAccountId}`,
      1,
      CONNECTION_CHECK_RATE_LIMIT_MAX,
      CONNECTION_CHECK_RATE_LIMIT_WINDOW_MS,
    );

    const data =
      await this.connectionProviderLifecycleHookService.runCheckConnection({
        provider,
        workspaceId,
        connectedAccountId,
        userId,
        userWorkspaceId,
      });

    return restrictConnectionCheckActionToProvider({
      result: fromHealthCheckDataToResultDto(data),
      provider,
    });
  }
}
