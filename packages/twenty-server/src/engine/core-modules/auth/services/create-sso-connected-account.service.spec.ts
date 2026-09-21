import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { CreateSsoConnectedAccountService } from 'src/engine/core-modules/auth/services/create-sso-connected-account.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

describe('CreateSsoConnectedAccountService', () => {
  let createSsoConnectedAccountService: CreateSsoConnectedAccountService;
  let connectedAccountRepository: Repository<ConnectedAccountEntity>;
  let userWorkspaceRepository: Repository<UserWorkspaceEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSsoConnectedAccountService,
        {
          provide: getRepositoryToken(ConnectedAccountEntity),
          useValue: {
            findOneBy: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserWorkspaceEntity),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
      ],
    }).compile();

    createSsoConnectedAccountService =
      module.get<CreateSsoConnectedAccountService>(
        CreateSsoConnectedAccountService,
      );
    connectedAccountRepository = module.get<Repository<ConnectedAccountEntity>>(
      getRepositoryToken(ConnectedAccountEntity),
    );
    userWorkspaceRepository = module.get<Repository<UserWorkspaceEntity>>(
      getRepositoryToken(UserWorkspaceEntity),
    );
  });

  it('should preserve mailbox scopes when updating an SSO connected account', async () => {
    const existingScopes = ['Mail.ReadWrite', 'Mail.Send', 'User.Read'];

    jest.spyOn(userWorkspaceRepository, 'findOneBy').mockResolvedValue({
      id: 'user-workspace-id',
    } as UserWorkspaceEntity);
    jest.spyOn(connectedAccountRepository, 'findOneBy').mockResolvedValue({
      id: 'connected-account-id',
      scopes: existingScopes,
    } as ConnectedAccountEntity);

    await createSsoConnectedAccountService.createOrUpdateSsoConnectedAccount({
      workspaceId: 'workspace-id',
      userId: 'user-id',
      handle: 'user@example.com',
      provider: ConnectedAccountProvider.MICROSOFT,
      scopes: ['User.Read'],
    });

    expect(connectedAccountRepository.update).toHaveBeenCalledTimes(1);
    expect(connectedAccountRepository.update).toHaveBeenCalledWith(
      'connected-account-id',
      expect.objectContaining({
        scopes: existingScopes,
      }),
    );
  });
});
