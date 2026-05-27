import { type ObjectPermissions } from 'twenty-shared/types';

import { DatabaseToolProvider } from 'src/engine/core-modules/tool-provider/providers/database-tool.provider';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const roleId = 'role-id';
const workspaceId = 'workspace-id';

const allObjectPermissions: ObjectPermissions = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const createFlatObject = (
  overrides: Partial<FlatObjectMetadata> &
    Pick<FlatObjectMetadata, 'nameSingular' | 'namePlural'>,
) =>
  getFlatObjectMetadataMock({
    universalIdentifier: overrides.nameSingular,
    labelSingular: overrides.nameSingular,
    labelPlural: overrides.namePlural,
    ...overrides,
  });

describe('DatabaseToolProvider', () => {
  const generateDescriptorNames = async (objects: FlatObjectMetadata[]) => {
    const flatObjectMetadataMaps =
      createEmptyFlatEntityMaps() as FlatEntityMaps<FlatObjectMetadata>;

    for (const object of objects) {
      flatObjectMetadataMaps.byUniversalIdentifier[
        object.universalIdentifier
      ] = object;
      flatObjectMetadataMaps.universalIdentifierById[object.id] =
        object.universalIdentifier;
    }

    const workspaceCacheService = {
      getOrRecompute: jest.fn().mockResolvedValue({
        rolesPermissions: {
          [roleId]: Object.fromEntries(
            objects.map((object) => [object.id, allObjectPermissions]),
          ),
        },
      }),
    } as unknown as WorkspaceCacheService;

    const flatEntityMapsCacheService = {
      getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
        flatObjectMetadataMaps,
        flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
      }),
    } as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService;

    const provider = new DatabaseToolProvider(
      workspaceCacheService,
      flatEntityMapsCacheService,
    );

    const descriptors = (await provider.generateDescriptors(
      {
        workspaceId,
        roleId,
        rolePermissionConfig: { unionOf: [roleId] },
      },
      { includeSchemas: false },
    )) as ToolDescriptor[];

    return descriptors.map((descriptor) => descriptor.name);
  };

  it('does not advertise write tools for system join objects', async () => {
    const descriptorNames = await generateDescriptorNames([
      createFlatObject({
        nameSingular: 'noteTarget',
        namePlural: 'noteTargets',
        isSystem: true,
      }),
      createFlatObject({
        nameSingular: 'taskTarget',
        namePlural: 'taskTargets',
        isSystem: true,
      }),
      createFlatObject({
        nameSingular: 'person',
        namePlural: 'people',
      }),
      createFlatObject({
        nameSingular: 'company',
        namePlural: 'companies',
      }),
      createFlatObject({
        nameSingular: 'opportunity',
        namePlural: 'opportunities',
      }),
      createFlatObject({
        nameSingular: 'note',
        namePlural: 'notes',
        isCustom: false,
      }),
    ]);

    expect(descriptorNames).toEqual(
      expect.arrayContaining([
        'find_note_targets',
        'find_one_note_target',
        'find_task_targets',
        'find_one_task_target',
        'create_person',
        'create_company',
        'create_opportunity',
        'create_note',
      ]),
    );

    expect(descriptorNames).toEqual(
      expect.not.arrayContaining([
        'create_note_target',
        'create_many_note_targets',
        'update_note_target',
        'update_many_note_targets',
        'delete_note_target',
        'create_task_target',
        'create_many_task_targets',
        'update_task_target',
        'update_many_task_targets',
        'delete_task_target',
      ]),
    );
  });
});
