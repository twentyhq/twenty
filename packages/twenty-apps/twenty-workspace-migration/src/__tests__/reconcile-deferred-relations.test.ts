import { beforeEach, describe, expect, it } from 'vitest';
import { reconcileDeferredRelations } from 'src/logic-functions/migration/reconcile-deferred-relations.util';
import { createMockGraphqlClient } from 'src/__tests__/utils/mock-graphql-client';
import { FieldMetadataType } from 'src/logic-functions/types/field-metadata-type.enum';
import {
  FieldsListType,
  ObjectOpenRecordIn,
  ObjectType,
  RelationType,
} from 'src/logic-functions/types/find-objects-fields.type';
import { migrationState } from 'src/logic-functions/utils/migration-state.util';
import { buildTestRecordIds } from 'src/__tests__/utils/build-test-record-ids';

const buildIdField = (): FieldsListType => ({
  applicationId: 'app-1',
  defaultValue: null,
  description: '',
  icon: null,
  id: 'field-id',
  isActive: true,
  isLabelSyncedWithName: false,
  isNullable: false,
  isSystem: false,
  isUIEditable: false,
  isUIReadOnly: true,
  isUnique: true,
  label: 'Id',
  morphId: null,
  morphRelations: null,
  name: 'id',
  objectMetadataId: 'object-1',
  options: null,
  relation: null,
  settings: null,
  type: FieldMetadataType.UUID,
  universalIdentifier: 'universal-field-id',
} as unknown as FieldsListType);

const buildRelationField = (name: string, targetNameSingular: string, id: string): FieldsListType => ({
  applicationId: 'app-1',
  defaultValue: null,
  description: '',
  icon: null,
  id,
  isActive: true,
  isLabelSyncedWithName: false,
  isNullable: true,
  isSystem: false,
  isUIEditable: true,
  isUIReadOnly: false,
  isUnique: false,
  label: name,
  morphId: null,
  morphRelations: null,
  name,
  objectMetadataId: 'object-1',
  options: null,
  relation: {
    type: RelationType.MANY_TO_ONE,
    targetObjectMetadata: { nameSingular: targetNameSingular },
    targetFieldMetadata: { icon: null, label: 'Children' },
  },
  settings: { relationType: RelationType.MANY_TO_ONE },
  type: FieldMetadataType.RELATION,
  universalIdentifier: `universal-${id}`,
} as unknown as FieldsListType);

const buildObject = (nameSingular: string, namePlural: string, fields: FieldsListType[]): ObjectType => ({
  applicationId: 'app-1',
  color: 'blue',
  description: '',
  fieldsList: [buildIdField(), ...fields],
  icon: 'IconBuilding',
  id: `object-${nameSingular}`,
  isActive: true,
  isLabelSyncedWithName: false,
  isSystem: false,
  labelIdentifierFieldMetadataId: 'field-id',
  labelPlural: namePlural,
  labelSingular: nameSingular,
  namePlural,
  nameSingular,
  openRecordIn: ObjectOpenRecordIn.RECORD_PAGE,
  universalIdentifier: `universal-object-${nameSingular}`,
});

describe('reconcileDeferredRelations', () => {
  beforeEach(() => {
    migrationState.reconciliationObjectIndex = 0;
    migrationState.objectRecordsToMigrate = new Map();
  });

  it('writes back a self-referential foreign key that was dropped at insert time', async () => {
    const company = buildObject('company', 'companies', [
      buildRelationField('parent', 'company', 'field-parent'),
    ]);
    const { client: sourceClient } = createMockGraphqlClient({
      findManyCompanies: {
        companies: {
          edges: [{ node: { id: 'child-1', parentId: 'parent-1' } }],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    });
    const { client: targetClient, calls: targetCalls } = createMockGraphqlClient({
      updateCompany: { updateCompany: { id: 'child-1' } },
    });
    const recordIds = buildTestRecordIds(['child-1', 'parent-1']);

    const result = await reconcileDeferredRelations(sourceClient, targetClient, [company], recordIds);

    expect(result).toBe(true);
    const updateCalls = targetCalls.filter((call) => call.operationName === 'updateCompany');
    expect(updateCalls).toHaveLength(1);
    expect(updateCalls[0].query).toContain('parentId: "parent-1"');
  });

  it('does not touch an object whose relations all point at earlier-migrated objects', async () => {
    const company = buildObject('company', 'companies', []);
    const person = buildObject('person', 'people', [
      buildRelationField('company', 'company', 'field-company'),
    ]);
    const { client: sourceClient, calls: sourceCalls } = createMockGraphqlClient({});
    const { client: targetClient, calls: targetCalls } = createMockGraphqlClient({});

    const result = await reconcileDeferredRelations(sourceClient, targetClient, [company, person], buildTestRecordIds());

    expect(result).toBe(true);
    expect(sourceCalls).toHaveLength(0);
    expect(targetCalls).toHaveLength(0);
  });

  it('skips a record whose referenced parent was never migrated', async () => {
    const company = buildObject('company', 'companies', [
      buildRelationField('parent', 'company', 'field-parent'),
    ]);
    const { client: sourceClient } = createMockGraphqlClient({
      findManyCompanies: {
        companies: {
          edges: [{ node: { id: 'child-1', parentId: 'never-migrated' } }],
          pageInfo: { hasNextPage: false, endCursor: null },
        },
      },
    });
    const { client: targetClient, calls: targetCalls } = createMockGraphqlClient({});
    const recordIds = buildTestRecordIds(['child-1']);

    const result = await reconcileDeferredRelations(sourceClient, targetClient, [company], recordIds);

    expect(result).toBe(true);
    expect(targetCalls).toHaveLength(0);
  });

  it('resumes from reconciliationObjectIndex instead of redoing finished objects', async () => {
    const company = buildObject('company', 'companies', [
      buildRelationField('parent', 'company', 'field-parent'),
    ]);
    migrationState.reconciliationObjectIndex = 1;
    const { client: sourceClient, calls: sourceCalls } = createMockGraphqlClient({});
    const { client: targetClient } = createMockGraphqlClient({});

    const result = await reconcileDeferredRelations(sourceClient, targetClient, [company], buildTestRecordIds());

    expect(result).toBe(true);
    expect(sourceCalls).toHaveLength(0);
  });
});
