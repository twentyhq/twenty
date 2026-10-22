import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmailOperation } from 'twenty-shared/types';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { UserWorkspaceDefaultFromHandleService } from 'src/engine/core-modules/user-workspace/services/user-workspace-default-from-handle.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountMetadataService } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.service';

describe('UserWorkspaceDefaultFromHandleService', () => {
  const userWorkspaceId = 'user-workspace-id';
  const workspaceId = 'workspace-id';

  let service: UserWorkspaceDefaultFromHandleService;
  const userWorkspaceRepository = { update: jest.fn() };
  const coreEntityCacheService = { invalidate: jest.fn() };
  const connectedAccountMetadataService = {
    findMailboxesUsableByCaller: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    connectedAccountMetadataService.findMailboxesUsableByCaller.mockResolvedValue(
      [{ handle: 'Me@Example.com', handleAliases: ['sales@example.com'] }],
    );

    const module = await Test.createTestingModule({
      providers: [
        UserWorkspaceDefaultFromHandleService,
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: userWorkspaceRepository,
        },
        {
          provide: ConnectedAccountMetadataService,
          useValue: connectedAccountMetadataService,
        },
        { provide: CoreEntityCacheService, useValue: coreEntityCacheService },
      ],
    }).compile();

    service = module.get(UserWorkspaceDefaultFromHandleService);
  });

  it('saves a sendable handle spelled as stored on the account', async () => {
    await service.updateDefaultFromHandle({
      userWorkspaceId,
      workspaceId,
      defaultFromHandle: 'me@example.com',
    });

    expect(userWorkspaceRepository.update).toHaveBeenCalledWith(
      { id: userWorkspaceId, workspaceId },
      { defaultFromHandle: 'Me@Example.com' },
    );
    expect(coreEntityCacheService.invalidate).toHaveBeenCalledWith(
      'userWorkspaceEntity',
      userWorkspaceId,
    );
    expect(
      connectedAccountMetadataService.findMailboxesUsableByCaller,
    ).toHaveBeenCalledWith({
      userWorkspaceId,
      workspaceId,
      operation: EmailOperation.SEND,
    });
  });

  it('saves an alias of a connected account', async () => {
    await service.updateDefaultFromHandle({
      userWorkspaceId,
      workspaceId,
      defaultFromHandle: 'SALES@example.com',
    });

    expect(userWorkspaceRepository.update).toHaveBeenCalledWith(
      { id: userWorkspaceId, workspaceId },
      { defaultFromHandle: 'sales@example.com' },
    );
  });

  it('rejects a handle that no sendable mailbox can send from', async () => {
    const error = await service
      .updateDefaultFromHandle({
        userWorkspaceId,
        workspaceId,
        defaultFromHandle: 'unknown@example.com',
      })
      .catch((caughtError: unknown) => caughtError);

    expect(error).toBeInstanceOf(UserInputError);
    expect((error as UserInputError).extensions.userFriendlyMessage).toEqual(
      expect.objectContaining({
        message: 'You cannot send from this address.',
      }),
    );
    expect(coreEntityCacheService.invalidate).not.toHaveBeenCalled();
    expect(userWorkspaceRepository.update).not.toHaveBeenCalled();
  });

  it('clears the handle when given null', async () => {
    await service.updateDefaultFromHandle({
      userWorkspaceId,
      workspaceId,
      defaultFromHandle: null,
    });

    expect(userWorkspaceRepository.update).toHaveBeenCalledWith(
      { id: userWorkspaceId, workspaceId },
      { defaultFromHandle: null },
    );
    expect(coreEntityCacheService.invalidate).toHaveBeenCalledWith(
      'userWorkspaceEntity',
      userWorkspaceId,
    );
    expect(
      connectedAccountMetadataService.findMailboxesUsableByCaller,
    ).not.toHaveBeenCalled();
  });
});
