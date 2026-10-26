import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  FieldMetadataType,
  RowLevelPermissionPredicateOperand,
  type RecordPermissionRule,
} from 'twenty-shared/types';
import { v4 } from 'uuid';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { type RecordPermissionContext } from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

export const createRecordPermissionTestContext = () => {
  const workspaceId = v4();
  const objects = Object.fromEntries(
    [
      'company',
      'person',
      'messageParticipant',
      'message',
      'recordShare',
      'workspaceMember',
    ].map((name) => [
      name,
      getFlatObjectMetadataMock({
        id: v4(),
        universalIdentifier: v4(),
        workspaceId,
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        nameSingular: name,
        namePlural: `${name}s`,
        targetTableName: name,
      }),
    ]),
  );
  const context: RecordPermissionContext = {
    revisionId: v4(),
    schemaName: getWorkspaceSchemaName(workspaceId),
    definition: { version: 1, objects: [] },
    flatObjectMetadataMaps: createEmptyFlatEntityMaps(),
    flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
    authorities: [{ roleId: v4(), roleUniversalIdentifier: v4() }],
    capabilitiesByObjectUniversalIdentifier: {},
  };
  for (const object of Object.values(objects)) {
    context.flatObjectMetadataMaps.byUniversalIdentifier[
      object.universalIdentifier
    ] = object;
    context.flatObjectMetadataMaps.universalIdentifierById[object.id] =
      object.universalIdentifier;
    if (object.nameSingular !== 'recordShare')
      context.definition.objects.push({
        objectUniversalIdentifier: object.universalIdentifier,
        rules: [],
        inheritancePaths: [],
      });
  }
  const addField = (
    objectName: string,
    name: string,
    type: FieldMetadataType,
  ) => {
    const object = objects[objectName];
    const field = getFlatFieldMetadataMock({
      id: v4(),
      universalIdentifier: v4(),
      objectMetadataId: object.id,
      objectMetadataUniversalIdentifier: object.universalIdentifier,
      name,
      type,
    });
    object.fieldIds.push(field.id);
    object.fieldUniversalIdentifiers.push(field.universalIdentifier);
    context.flatFieldMetadataMaps.byUniversalIdentifier[
      field.universalIdentifier
    ] = field;
    context.flatFieldMetadataMaps.universalIdentifierById[field.id] =
      field.universalIdentifier;
    return field;
  };
  for (const name of Object.keys(objects))
    addField(name, 'id', FieldMetadataType.UUID);
  const city = addField('company', 'city', FieldMetadataType.TEXT);
  const memberCity = addField(
    'workspaceMember',
    'city',
    FieldMetadataType.TEXT,
  );
  const relation = (
    source: string,
    target: string,
    sourceName: string,
    targetName: string,
    manyToOne: boolean,
  ) => {
    const sourceField = addField(
      source,
      sourceName,
      FieldMetadataType.RELATION,
    );
    const targetField = addField(
      target,
      targetName,
      FieldMetadataType.RELATION,
    );
    for (const [field, inverse, targetObject, isManyToOne] of [
      [sourceField, targetField, objects[target], manyToOne],
      [targetField, sourceField, objects[source], !manyToOne],
    ] as const) {
      Object.assign(field, {
        relationTargetObjectMetadataId: targetObject.id,
        relationTargetFieldMetadataId: inverse.id,
        settings: {
          relationType: isManyToOne
            ? RelationType.MANY_TO_ONE
            : RelationType.ONE_TO_MANY,
        },
      });
    }
    return sourceField;
  };
  const people = relation('company', 'person', 'people', 'company', false);
  const participants = relation(
    'person',
    'messageParticipant',
    'messageParticipants',
    'person',
    false,
  );
  const message = relation(
    'messageParticipant',
    'message',
    'message',
    'messageParticipants',
    true,
  );
  const rule: RecordPermissionRule = {
    universalIdentifier: v4(),
    label: 'Paris',
    roleUniversalIdentifier: context.authorities[0].roleUniversalIdentifier,
    actions: ['read', 'update', 'share', 'receive'],
    condition: {
      kind: 'predicate',
      fieldUniversalIdentifier: city.universalIdentifier,
      operand: RowLevelPermissionPredicateOperand.CONTAINS,
      value: 'Paris',
    },
  };
  context.definition.objects
    .find(
      (object) =>
        object.objectUniversalIdentifier ===
        objects.company.universalIdentifier,
    )!
    .rules.push(rule);
  context.definition.objects
    .find(
      (object) =>
        object.objectUniversalIdentifier ===
        objects.message.universalIdentifier,
    )!
    .inheritancePaths.push({
      universalIdentifier: v4(),
      sourceObjectUniversalIdentifier: objects.company.universalIdentifier,
      fieldUniversalIdentifiers: [
        people.universalIdentifier,
        participants.universalIdentifier,
        message.universalIdentifier,
      ],
    });
  return {
    context,
    objects,
    rule,
    city,
    memberCity,
    people,
    participants,
    message,
  };
};
