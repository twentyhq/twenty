import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { EmailOperation } from 'twenty-shared/types';
import { getSendableEmailHandles, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';

@Injectable()
export class UserWorkspaceDefaultFromHandleService {
  constructor(
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    private readonly connectedAccountMetadataService: ConnectedAccountMetadataService,
  ) {}

  async updateDefaultFromHandle({
    userWorkspaceId,
    workspaceId,
    defaultFromHandle,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
    defaultFromHandle: string | null;
  }): Promise<void> {
    let storedHandle: string | null = null;

    if (isDefined(defaultFromHandle)) {
      const sendableMailboxes =
        await this.connectedAccountMetadataService.findMailboxesUsableByCaller({
          userWorkspaceId,
          workspaceId,
          operation: EmailOperation.SEND,
        });

      const sendableHandles = sendableMailboxes.flatMap(
        getSendableEmailHandles,
      );

      storedHandle =
        sendableHandles.find(
          (handle) => handle.toLowerCase() === defaultFromHandle.toLowerCase(),
        ) ?? null;

      if (!isDefined(storedHandle)) {
        throw new UserInputError('Handle is not sendable by this user', {
          userFriendlyMessage: msg`You cannot send from this address.`,
        });
      }
    }

    await this.userWorkspaceRepository.update(
      { id: userWorkspaceId, workspaceId },
      { defaultFromHandle: storedHandle },
    );

    await this.coreEntityCacheService.invalidate(
      'userWorkspaceEntity',
      userWorkspaceId,
    );
  }
}
