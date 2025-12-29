import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import {
  type ActorMetadata,
  FieldActorSource,
  type FullNameMetadata,
} from 'twenty-shared/types';

import { ActorFromAuthContextService } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

type TestingAuthContext = Omit<AuthContext, 'workspace' | 'apiKey' | 'user'> & {
  workspace: Partial<WorkspaceEntity>;
  apiKey?: Partial<ApiKeyEntity>;
  user?: Partial<UserEntity>;
};

type ExpectedResult = { createdBy: ActorMetadata }[];

// TODO create util
const fromFullNameMetadataToName = ({
  firstName,
  lastName,
}: FullNameMetadata) => `${firstName} ${lastName}`;

describe('ActorFromAuthContextService', () => {
  let service: ActorFromAuthContextService;
  const mockWorkspaceMemberRepository = {
    findOneOrFail: jest.fn(),
  };
  const globalWorkspaceOrmManager: jest.Mocked<
    Pick<
      GlobalWorkspaceOrmManager,
      'getRepository' | 'executeInWorkspaceContext'
    >
  > = {
    getRepository: jest.fn().mockResolvedValue(mockWorkspaceMemberRepository),
    executeInWorkspaceContext: jest
      .fn()
      .mockImplementation((_authContext: any, fn: () => any) => fn()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActorFromAuthContextService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: globalWorkspaceOrmManager,
        },
        {
          provide: getRepositoryToken(FieldMetadataEntity),
          useValue: {
            findOne: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
              flatObjectMetadataMaps: {
                byId: {
                  'person-id': {
                    id: 'person-id',
                    nameSingular: 'person',
                    fieldMetadataIds: ['createdBy-id'],
                  },
                },
              },
              flatFieldMetadataMaps: {
                byId: {
                  'createdBy-id': {
                    id: 'createdBy-id',
                    name: 'createdBy',
                    objectMetadataId: 'person-id',
                  },
                },
              },
              flatIndexMaps: {
                byId: {},
              },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ActorFromAuthContextService>(
      ActorFromAuthContextService,
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
          firstName: '',
          lastName: '',
          id: '20202020-9aae-49a8-bafc-ac44bae62d6d',
        },
        workspace: { id: '20202020-bdec-497f-847a-1bb334fefe58' },
      } as const satisfies TestingAuthContext;

      const mockedWorkspaceMember = {
        id: '20202020-0b5c-4178-bed7-d371f6411eaa',
        name: {
          firstName: 'John',
          lastName: 'Doe',
        },
      } as const satisfies Partial<WorkspaceMemberWorkspaceEntity>;

      mockWorkspaceMemberRepository.findOneOrFail.mockResolvedValueOnce(
        mockedWorkspaceMember,
      );

      const result = await service.injectCreatedBy({
        records: [{}],
        objectMetadataNameSingular: 'person',
        authContext: authContext as AuthContext,
      });

      expect(result).toEqual<ExpectedResult>([
        {
          createdBy: {
            context: {},
            name: fromFullNameMetadataToName(mockedWorkspaceMember.name),
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

      const result = await service.injectCreatedBy({
        records: [{}],
        objectMetadataNameSingular: 'person',
        authContext: authContext as AuthContext,
      });

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

      const result = await service.injectCreatedBy({
        records: [{}],
        objectMetadataNameSingular: 'person',
        authContext: authContext as AuthContext,
      });

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
        service.injectCreatedBy({
          records: [{}],
          objectMetadataNameSingular: 'person',
          authContext: authContext as AuthContext,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Unable to build actor metadata - no valid actor information found in auth context"`,
      );
    });
  });
});
