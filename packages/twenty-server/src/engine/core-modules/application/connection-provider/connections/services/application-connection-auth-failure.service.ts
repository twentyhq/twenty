import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

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
    const account = await this.connectedAccountRepository.findOne({
      where: {
        id,
        applicationId,
        workspaceId,
        provider: ConnectedAccountProvider.APP,
      },
    });

    if (!isDefined(account)) {
      throw new NotFoundException(`Connection ${id} not found`);
    }

    if (
      isConnectionHiddenFromRequestUser({ account, requestUserWorkspaceId })
    ) {
      throw new NotFoundException(`Connection ${id} not found`);
    }

    await this.connectedAccountRepository.update(
      { id: account.id, workspaceId },
      { authFailedAt: new Date(), authFailedReason: reason },
    );
  }
}
