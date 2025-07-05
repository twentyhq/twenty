import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { CreatedByFromAuthContextService } from 'src/engine/core-modules/actor/services/created-by-from-auth-context.service';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { FullNameMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/full-name.composite-type';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

type TestingAuthContext = Omit<AuthContext, 'workspace' | 'apiKey' | 'user'> & {
  workspace: Partial<Workspace>;
  apiKey?: Partial<ApiKey>;
  user?: Partial<User>;
};

type ExpectedResult = { createdBy: ActorMetadata }[];

// TODO create util
const fromFullNameMetadataToName = ({
  firstName,
  lastName,
}: FullNameMetadata) => `${firstName} ${lastName}`;

describe('CreatedByFromAuthContextService', () => {
  let service: CreatedByFromAuthContextService;
  const mockWorkspaceMemberRepository = {
    findOneOrFail: jest.fn(),
  };
  const twentyORMGlobalManager: jest.Mocked<
    Pick<TwentyORMGlobalManager, 'getRepositoryForWorkspace'>
  > = {
    getRepositoryForWorkspace: jest
      .fn()
      .mockResolvedValue(mockWorkspaceMemberRepository),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatedByFromAuthContextService,
        {
          provide: TwentyORMGlobalManager,
          useValue: twentyORMGlobalManager,
        },
        {
          provide: getRepositoryToken(FieldMetadataEntity, 'core'),
          useValue: {
            findOne: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<CreatedByFromAuthContextService>(
      CreatedByFromAuthContextService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('injectCreatedBy', () => {
    it('should build metadata from workspaceMemberId and user when both are present', async () => {
      const authContext = {
        workspaceMemberId: '20202020-0b5c-4178-bed7-d371f6411eaa',
        user: {
          firstName: 'John',
          lastName: 'Doe',
          id: '20202020-9aae-49a8-bafc-ac44bae62d6d',
        },
        workspace: { id: '20202020-bdec-497f-847a-1bb334fefe58' },
      } as const satisfies TestingAuthContext;

      const result = await service.injectCreatedBy(
        [{}],
        'person',
        authContext as AuthContext,
      );

      expect(result).toEqual<ExpectedResult>([
        {
          createdBy: {
            context: {},
            name: fromFullNameMetadataToName(authContext.user),
            workspaceMemberId: authContext.workspaceMemberId,
            source: FieldActorSource.MANUAL,
          },
        },
      ]);
    });

    it('should build metadata from user when workspaceMemberId is missing', async () => {
      const authContext = {
        user: {
          firstName: 'John',
          lastName: 'Doe',
          id: '20202020-9aae-49a8-bafc-ac44bae62d6d',
        },
        workspace: { id: '20202020-bdec-497f-847a-1bb334fefe58' },
      } as const satisfies TestingAuthContext;

      const mockedWorkspaceMember = {
        id: '20202020-78a3-4520-ba74-b0e1b534a501',
        name: {
          firstName: 'Pepito',
          lastName: 'Dubois',
        },
      } as const satisfies Partial<WorkspaceMemberWorkspaceEntity>;

      mockWorkspaceMemberRepository.findOneOrFail.mockResolvedValueOnce(
        mockedWorkspaceMember,
      );

      const result = await service.injectCreatedBy(
        [{}],
        'person',
        authContext as AuthContext,
      );

      expect(result).toEqual<ExpectedResult>([
        {
          createdBy: {
            context: {},
            name: fromFullNameMetadataToName(mockedWorkspaceMember.name),
            workspaceMemberId: mockedWorkspaceMember.id,
            source: FieldActorSource.MANUAL,
          },
        },
      ]);
    });

    it('should build metadata from apiKey when only apiKey is present', async () => {
      const authContext = {
        apiKey: {
          id: '20202020-56c2-471b-925d-31ed3ecd0951',
          name: 'API Key Name',
        },
        workspace: { id: '20202020-bdec-497f-847a-1bb334fefe58' },
      } as const satisfies TestingAuthContext;

      const result = await service.injectCreatedBy(
        [{}],
        'person',
        authContext as AuthContext,
      );

      expect(result).toEqual<ExpectedResult>([
        {
          createdBy: {
            source: FieldActorSource.API,
            workspaceMemberId: null,
            name: authContext.apiKey.name,
            context: {},
          },
        },
      ]);
    });

    it('should throw error when no valid actor information is found', async () => {
      const authContext = {
        workspace: { id: 'workspace-id' },
      } as const satisfies TestingAuthContext;

      await expect(
        service.injectCreatedBy([{}], 'person', authContext as AuthContext),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Unable to build createdBy metadata - no valid actor information found in auth context"`,
      );
    });
  });
});
