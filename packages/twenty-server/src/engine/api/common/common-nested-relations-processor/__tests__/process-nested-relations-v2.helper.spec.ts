import {
  FieldMetadataType,
  RelationType,
  type ObjectRecord,
} from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { ProcessNestedRelationsV2Helper } from 'src/engine/api/common/common-nested-relations-processor/process-nested-relations-v2.helper';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';

const MORPH_TARGET_NAMES = ['company', 'person', 'note', 'task'] as const;

type MorphTargetName = (typeof MORPH_TARGET_NAMES)[number];

const morphFieldName = (targetName: MorphTargetName) =>
  `target${capitalize(targetName)}`;

const buildFlatEntityMaps = <
  TEntity extends FlatObjectMetadata | FlatFieldMetadata,
>(
  entities: TEntity[],
): FlatEntityMaps<TEntity> => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
  universalIdentifierById: Object.fromEntries(
    entities.map((entity) => [entity.id, entity.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
});

const targetObjectByName = Object.fromEntries(
  MORPH_TARGET_NAMES.map((targetName) => [
    targetName,
    getFlatObjectMetadataMock({
      universalIdentifier: `${targetName}-object-universal-identifier`,
      id: `${targetName}-object-id`,
      nameSingular: targetName,
      namePlural: `${targetName}s`,
    }),
  ]),
) as Record<MorphTargetName, FlatObjectMetadata>;

const timelineActivityObject = getFlatObjectMetadataMock({
  universalIdentifier: 'timeline-activity-object-universal-identifier',
  id: 'timeline-activity-object-id',
  nameSingular: 'timelineActivity',
  namePlural: 'timelineActivities',
  fieldIds: MORPH_TARGET_NAMES.map((targetName) => `${targetName}-field-id`),
});

const morphFields = MORPH_TARGET_NAMES.map((targetName) =>
  getFlatFieldMetadataMock({
    universalIdentifier: `${targetName}-field-universal-identifier`,
    id: `${targetName}-field-id`,
    objectMetadataId: timelineActivityObject.id,
    type: FieldMetadataType.MORPH_RELATION,
    name: morphFieldName(targetName),
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: `${morphFieldName(targetName)}Id`,
    },
    relationTargetObjectMetadataId: targetObjectByName[targetName].id,
    relationTargetFieldMetadataId: `${targetName}-inverse-field-id`,
  }),
);

const flatObjectMetadataMaps = buildFlatEntityMaps<FlatObjectMetadata>([
  timelineActivityObject,
  ...Object.values(targetObjectByName),
]);
const flatFieldMetadataMaps =
  buildFlatEntityMaps<FlatFieldMetadata>(morphFields);

const relations = Object.fromEntries(
  MORPH_TARGET_NAMES.map((targetName) => [morphFieldName(targetName), {}]),
);

const selectedFields = Object.fromEntries(
  MORPH_TARGET_NAMES.map((targetName) => [
    morphFieldName(targetName),
    { id: true },
  ]),
);

// Records which target object each relation query is actually sent against, so a
// test can assert on the number of round trips and not just on the returned data.
const buildDataSourceSpy = () => {
  const queriedObjectNames: string[] = [];

  const workspaceDataSource = {
    getRepository: (objectNameSingular: string) => ({
      createQueryBuilder: () => {
        const queryBuilder = {
          setFindOptions: () => queryBuilder,
          withDeleted: () => queryBuilder,
          getFindOptions: () => ({ select: {} }),
          where: () => queryBuilder,
          take: () => queryBuilder,
          getMany: async () => {
            queriedObjectNames.push(objectNameSingular);

            return [];
          },
        };

        return queryBuilder;
      },
    }),
  } as unknown as GlobalWorkspaceDataSource;

  return { workspaceDataSource, queriedObjectNames };
};

const processNestedRelations = async (
  parentObjectRecords: ObjectRecord[],
): Promise<string[]> => {
  const { workspaceDataSource, queriedObjectNames } = buildDataSourceSpy();

  await new ProcessNestedRelationsV2Helper().processNestedRelations({
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    parentObjectMetadataItem: timelineActivityObject,
    parentObjectRecords,
    relations,
    limit: 60,
    authContext: {} as WorkspaceAuthContext,
    workspaceDataSource,
    selectedFields,
  });

  return queriedObjectNames.sort();
};

const buildParentRecord = (
  id: string,
  setTargets: Partial<Record<MorphTargetName, string>> = {},
): ObjectRecord =>
  ({
    id,
    ...Object.fromEntries(
      MORPH_TARGET_NAMES.map((targetName) => [
        `${morphFieldName(targetName)}Id`,
        setTargets[targetName] ?? null,
      ]),
    ),
  }) as unknown as ObjectRecord;

describe('ProcessNestedRelationsV2Helper', () => {
  it('should not query morph targets whose join column is null on every parent record', async () => {
    const queriedObjectNames = await processNestedRelations([
      buildParentRecord('record-1', { company: 'company-1' }),
      buildParentRecord('record-2', { company: 'company-2' }),
    ]);

    expect(queriedObjectNames).toEqual(['company']);
  });

  it('should query every morph target that is set on at least one parent record', async () => {
    const queriedObjectNames = await processNestedRelations([
      buildParentRecord('record-1', { company: 'company-1' }),
      buildParentRecord('record-2', { person: 'person-1' }),
    ]);

    expect(queriedObjectNames).toEqual(['company', 'person']);
  });

  it('should assign null to unset to-one relations rather than leaving them undefined', async () => {
    const parentObjectRecords = [buildParentRecord('record-1')];

    const queriedObjectNames =
      await processNestedRelations(parentObjectRecords);

    expect(queriedObjectNames).toEqual([]);
    expect(parentObjectRecords[0]).toMatchObject({
      targetCompany: null,
      targetPerson: null,
      targetNote: null,
      targetTask: null,
    });
  });
});
