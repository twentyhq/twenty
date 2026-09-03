import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isConnectionHiddenFromRequestUser } from 'src/engine/core-modules/application/connection-provider/connections/utils/is-connection-hidden-from-request-user.util';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

type ReportAuthFailureArgs = {
  applicationId: string;
  workspaceId: string;
  requestUserWorkspaceId: string | null;
  id: string;
  reason: string | null;
};

// Lets an app mark one of its own connections as auth-failed, for providers
// whose tokens never go through the platform refresh flow (a revoked Slack
// bot token, for example, only ever fails at call time inside the app).
// The reconnect flow clears the flag the same way it does for refresh
// failures.
@Injectable()
export class ApplicationConnectionAuthFailureService {
  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  async reportAuthFailure({
    applicationId,
    workspaceId,
    requestUserWorkspaceId,
    id,
    reason,
  }: ReportAuthFailureArgs): Promise<void> {
    const scopedWhere = {
      id,
      applicationId,
      workspaceId,
      provider: ConnectedAccountProvider.APP,
    };

    const account = await this.connectedAccountRepository.findOne({
      where: scopedWhere,
    });

    if (!isDefined(account)) {
      throw new NotFoundException(`Connection ${id} not found`);
    }

    if (
      isConnectionHiddenFromRequestUser({ account, requestUserWorkspaceId })
    ) {
      throw new NotFoundException(`Connection ${id} not found`);
    }

    // Guard against a reconnect racing this report: every reconnect bumps
    // lastCredentialsRefreshedAt, so a report describing the pre-reconnect
    // token matches zero rows instead of resurrecting a cleared failure.
    const updateResult = await this.connectedAccountRepository.update(
      {
        ...scopedWhere,
        lastCredentialsRefreshedAt: isDefined(
          account.lastCredentialsRefreshedAt,
        )
          ? account.lastCredentialsRefreshedAt
          : IsNull(),
      },
      { authFailedAt: new Date(), authFailedReason: reason },
    );

    if (updateResult.affected === 0) {
      const currentAccount = await this.connectedAccountRepository.findOne({
        where: scopedWhere,
      });

      if (!isDefined(currentAccount)) {
        throw new NotFoundException(`Connection ${id} not found`);
      }
      // A reconnect superseded the report while it was in flight; the
      // failure described the old credential, so dropping it is correct.
    }
  }
}
