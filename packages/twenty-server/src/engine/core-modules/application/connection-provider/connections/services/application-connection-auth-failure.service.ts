import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';
import { isConnectionHiddenFromRequestUser } from 'src/engine/core-modules/application/connection-provider/connections/utils/is-connection-hidden-from-request-user.util';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

type ReportAuthFailureArgs = {
  applicationId: string;
  workspaceId: string;
  requestUserWorkspaceId: string | null;
  id: string;
  reason: string | null;
};

@Injectable()
export class ApplicationConnectionAuthFailureService {
  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
  ) {}

  async reportAuthFailureOrThrow({
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
      archivedAt: IsNull(),
    };

    const account = await this.connectedAccountRepository.findOne({
      where: scopedWhere,
    });

    if (
      !isDefined(account) ||
      isConnectionHiddenFromRequestUser({ account, requestUserWorkspaceId })
    ) {
      throw new ConnectionProviderException(
        `Connection ${id} not found`,
        ConnectionProviderExceptionCode.CONNECTION_NOT_FOUND,
      );
    }

    // Every reconnect rewrites lastCredentialsRefreshedAt, so matching on the
    // value we read drops a report that describes an already-replaced token
    // instead of resurrecting a failure the reconnect just cleared.
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
        throw new ConnectionProviderException(
          `Connection ${id} not found`,
          ConnectionProviderExceptionCode.CONNECTION_NOT_FOUND,
        );
      }
      // A reconnect superseded the report while it was in flight; the failure
      // described the old credential, so dropping it is correct.
    }
  }
}
