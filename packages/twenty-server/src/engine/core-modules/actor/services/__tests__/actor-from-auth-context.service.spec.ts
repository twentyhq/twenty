import { Test, type TestingModule } from '@nestjs/testing';

import {
  type ActorMetadata,
  FieldActorSource,
  type FullNameMetadata,
} from 'twenty-shared/types';

import { ActorFromAuthContextService } from 'src/engine/core-modules/actor/services/actor-from-auth-context.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';

type ExpectedResult = { createdBy: ActorMetadata }[];

const fromFullNameMetadataToName = ({
  firstName,
  lastName,
}: FullNameMetadata) => `${firstName} ${lastName}`;

describe('ActorFromAuthContextService', () => {
  let service: ActorFromAuthContextService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActorFromAuthContextService,
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
              flatObjectMetadataMaps: {
                byUniversalIdentifier: {
                  'person-universal-id': {
                    id: 'person-id',
                    nameSingular: 'person',
                    fieldIds: ['createdBy-id'],
                    universalIdentifier: 'person-universal-id',
                  },
                },
                universalIdentifierById: {
                  'person-id': 'person-universal-id',
                },
                universalIdentifiersByApplicationId: {},
              },
              flatFieldMetadataMaps: {
                byUniversalIdentifier: {
                  'createdBy-universal-id': {
                    id: 'createdBy-id',
                    name: 'createdBy',
                    objectMetadataId: 'person-id',
                    universalIdentifier: 'createdBy-universal-id',
                  },
                },
                universalIdentifierById: {
                  'createdBy-id': 'createdBy-universal-id',
                },
                universalIdentifiersByApplicationId: {},
              },
              flatIndexMaps: {
                byUniversalIdentifier: {},
                universalIdentifierById: {},
                universalIdentifiersByApplicationId: {},
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
    it('should build metadata from workspaceMember when user auth context', async () => {
      const workspaceMemberName = {
        firstName: 'John',
        lastName: 'Doe',
      };

      const authContext = {
        type: 'user',
        workspaceMemberId: '20202020-0b5c-4178-bed7-d371f6411eaa',
        userWorkspaceId: '20202020-1234-5678-9012-345678901234',
        user: {
          id: '20202020-9aae-49a8-bafc-ac44bae62d6d',
        },
        workspaceMember: {
          id: '20202020-0b5c-4178-bed7-d371f6411eaa',
          name: workspaceMemberName,
        },
        workspace: { id: '20202020-bdec-497f-847a-1bb334fefe58' },
      } as unknown as WorkspaceAuthContext;

      const result = await service.injectCreatedBy({
        records: [{}],
        objectMetadataNameSingular: 'person',
        authContext,
      });

      expect(result).toEqual<ExpectedResult>([
        {
          createdBy: {
            context: {},
            name: fromFullNameMetadataToName(workspaceMemberName),
            workspaceMemberId: '20202020-0b5c-4178-bed7-d371f6411eaa',
            source: FieldActorSource.MANUAL,
          },
        },
      ]);
    });

    it('should build metadata from apiKey when apiKey auth context', async () => {
      const authContext = {
        type: 'apiKey',
        apiKey: {
          id: '20202020-56c2-471b-925d-31ed3ecd0951',
          name: 'API Key Name',
        },
        workspace: { id: '20202020-bdec-497f-847a-1bb334fefe58' },
      } as unknown as WorkspaceAuthContext;

      const result = await service.injectCreatedBy({
        records: [{}],
        objectMetadataNameSingular: 'person',
        authContext,
      });

      expect(result).toEqual<ExpectedResult>([
        {
          createdBy: {
            source: FieldActorSource.API,
            workspaceMemberId: null,
            name: 'API Key Name',
            context: {},
          },
        },
      ]);
    });

    it('should build metadata from user when pendingActivationUser auth context', async () => {
      const authContext = {
        type: 'pendingActivationUser',
        userWorkspaceId: '20202020-1234-5678-9012-345678901234',
        user: {
          id: '20202020-9aae-49a8-bafc-ac44bae62d6d',
          firstName: 'Simone',
          lastName: 'Ergotino',
        },
        workspace: { id: '20202020-bdec-497f-847a-1bb334fefe58' },
      } as unknown as WorkspaceAuthContext;

      const result = await service.injectCreatedBy({
        records: [{}],
        objectMetadataNameSingular: 'person',
        authContext,
      });

      expect(result).toEqual<ExpectedResult>([
        {
          createdBy: {
            context: {},
            name: 'Simone Ergotino',
            workspaceMemberId: '',
            source: FieldActorSource.MANUAL,
          },
        },
      ]);
    });

    it('should throw error when no valid actor information is found', async () => {
      const authContext = {
        type: 'system',
        workspace: { id: 'workspace-id' },
      } as unknown as WorkspaceAuthContext;

      await expect(
        service.injectCreatedBy({
          records: [{}],
          objectMetadataNameSingular: 'person',
          authContext,
        }),
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Unable to build actor metadata - unhandled auth context type: system"`,
      );
    });
  });
});
