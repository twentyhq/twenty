/* @license Enterprise */

import {
  FieldMetadataType,
  MetadataReadability,
  RecordShareAccessLevel,
} from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { buildRecordShareGate } from 'src/engine/core-modules/record-share/utils/build-record-share-gate.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';
import { type RowAccessPolicySubject } from 'src/engine/twenty-orm/types/row-access-policy.type';

const THREAD_OBJECT_ID = 'thread-object-id';
const THREAD_TARGET_OBJECT_ID = 'thread-target-object-id';
const PERSON_OBJECT_ID = 'person-object-id';
const NOTE_TARGET_OBJECT_ID = 'note-target-object-id';

const buildManyToOneField = ({
  name,
  objectMetadataId,
  relationTargetObjectMetadataId,
}: {
  name: string;
  objectMetadataId: string;
  relationTargetObjectMetadataId: string;
}) =>
  getFlatFieldMetadataMock({
    id: `${objectMetadataId}-${name}`,
    name,
    type: FieldMetadataType.RELATION,
    universalIdentifier: `${objectMetadataId}-${name}-universal-identifier`,
    objectMetadataId,
    relationTargetObjectMetadataId,
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: `${name}Id`,
    },
  } as Parameters<typeof getFlatFieldMetadataMock>[0]);

const threadField = buildManyToOneField({
  name: 'thread',
  objectMetadataId: THREAD_TARGET_OBJECT_ID,
  relationTargetObjectMetadataId: THREAD_OBJECT_ID,
});
const targetPersonField = buildManyToOneField({
  name: 'targetPerson',
  objectMetadataId: NOTE_TARGET_OBJECT_ID,
  relationTargetObjectMetadataId: PERSON_OBJECT_ID,
});

const buildFlatEntityMaps = <T extends FlatFieldMetadata | FlatObjectMetadata>(
  flatEntities: T[],
): FlatEntityMaps<T> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.id,
      flatEntity.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildObject = ({
  id,
  readability,
  parentField,
}: {
  id: string;
  readability: MetadataReadability;
  parentField?: FlatFieldMetadata;
}) =>
  getFlatObjectMetadataMock({
    id,
    universalIdentifier: `${id}-universal-identifier`,
    nameSingular: id,
    isSystem: true,
    readability,
    fieldIds: parentField ? [parentField.id] : [],
    readabilityParentFieldUniversalIdentifiers: parentField
      ? [parentField.universalIdentifier]
      : null,
  });

const thread = buildObject({
  id: THREAD_OBJECT_ID,
  readability: MetadataReadability.PRIVATE,
});
const threadTarget = buildObject({
  id: THREAD_TARGET_OBJECT_ID,
  readability: MetadataReadability.INHERITED,
  parentField: threadField,
});
const person = buildObject({
  id: PERSON_OBJECT_ID,
  readability: MetadataReadability.OPEN,
});
const noteTarget = buildObject({
  id: NOTE_TARGET_OBJECT_ID,
  readability: MetadataReadability.INHERITED,
  parentField: targetPersonField,
});

const environment = {
  flatFieldMetadataMaps: buildFlatEntityMaps([threadField, targetPersonField]),
  flatObjectMetadataMaps: buildFlatEntityMaps([
    thread,
    threadTarget,
    person,
    noteTarget,
  ]),
  featureFlagsMap: {},
};

const member: RowAccessPolicySubject = {
  isSystemContext: false,
  objectsPermissions: undefined,
  principalIds: ['member-1'],
  canAccessAllRecords: true,
  isOwningApplication: () => false,
  resolveRowLevelPermissionRecordFilter: () => null,
};

const buildGate = ({
  subject = member,
  flatObjectMetadata = threadTarget,
  operationType = 'select',
}: {
  subject?: RowAccessPolicySubject;
  flatObjectMetadata?: FlatObjectMetadata;
  operationType?: OperationType;
} = {}) =>
  buildRecordShareGate({
    subject,
    environment,
    tableAlias: flatObjectMetadata.nameSingular,
    flatObjectMetadata,
    operationType,
  });

describe('buildRecordShareGate', () => {
  it('gates records linking to a PRIVATE parent on the shares of that parent', () => {
    expect(buildGate()).toEqual({
      kind: 'gated',
      expression: {
        kind: 'parentRecordShared',
        tableAlias: THREAD_TARGET_OBJECT_ID,
        joinColumnName: 'threadId',
        objectMetadataId: THREAD_OBJECT_ID,
        principalIds: ['member-1'],
        accessLevels: [
          RecordShareAccessLevel.READ,
          RecordShareAccessLevel.READ_WRITE,
          RecordShareAccessLevel.FULL,
        ],
      },
    });
  });

  it('requires the access level of the operation on the parent', () => {
    const gate = buildGate({ operationType: 'delete' });

    expect(gate.kind === 'gated' && gate.expression).toMatchObject({
      kind: 'parentRecordShared',
      accessLevels: [RecordShareAccessLevel.FULL],
    });
  });

  it('leaves inserts to the object-level permission', () => {
    expect(buildGate({ operationType: 'insert' })).toEqual({ kind: 'open' });
  });

  it('keeps records of an INHERITED object whose parent is not PRIVATE open', () => {
    expect(buildGate({ flatObjectMetadata: noteTarget })).toEqual({
      kind: 'open',
    });
  });

  it('opens records linking to a PRIVATE parent to its owning application and to subjects without principals', () => {
    expect(
      buildGate({
        subject: {
          ...member,
          isOwningApplication: (flatObjectMetadata) =>
            flatObjectMetadata.id === THREAD_OBJECT_ID,
        },
      }),
    ).toEqual({ kind: 'open' });
    expect(
      buildGate({ subject: { ...member, principalIds: undefined } }),
    ).toEqual({ kind: 'open' });
  });

  it('gates a PRIVATE object on its own shares', () => {
    const gate = buildGate({ flatObjectMetadata: thread });

    expect(gate.kind === 'gated' && gate.expression).toMatchObject({
      kind: 'recordShared',
      objectMetadataId: THREAD_OBJECT_ID,
    });
  });
});
