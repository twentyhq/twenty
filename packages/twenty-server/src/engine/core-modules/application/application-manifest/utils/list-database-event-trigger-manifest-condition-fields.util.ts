import {
  FieldMetadataType,
  RelationType,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type DatabaseEventTriggerManifestField } from 'src/engine/core-modules/application/application-manifest/types/database-event-trigger-manifest-field.type';
import { type DatabaseEventTriggerManifestLookup } from 'src/engine/core-modules/application/application-manifest/types/database-event-trigger-manifest-lookup.type';
import { listDatabaseEventTriggerManifestObjectFields } from 'src/engine/core-modules/application/application-manifest/utils/list-database-event-trigger-manifest-object-fields.util';

const toScalarConditionField = ({
  name,
  type,
  universalIdentifier,
}: Pick<
  DatabaseEventTriggerManifestField,
  'name' | 'type' | 'universalIdentifier'
>): ValidationRuleFieldDescriptor => ({
  name,
  type,
  universalIdentifier,
});

export const listDatabaseEventTriggerManifestConditionFields = ({
  lookup,
  objectUniversalIdentifier,
}: {
  lookup: DatabaseEventTriggerManifestLookup;
  objectUniversalIdentifier: string;
}): ValidationRuleFieldDescriptor[] =>
  listDatabaseEventTriggerManifestObjectFields({
    lookup,
    objectUniversalIdentifier,
  }).map((field) => {
    if (field.type !== FieldMetadataType.RELATION) {
      return toScalarConditionField(field);
    }

    if (
      field.relationType !== RelationType.MANY_TO_ONE ||
      !isDefined(field.relationTargetObjectUniversalIdentifier)
    ) {
      return {
        ...toScalarConditionField(field),
        relationType: field.relationType,
      };
    }

    return {
      ...toScalarConditionField(field),
      relationType: field.relationType,
      relationTargetFields: listDatabaseEventTriggerManifestObjectFields({
        lookup,
        objectUniversalIdentifier:
          field.relationTargetObjectUniversalIdentifier,
      }).map(toScalarConditionField),
    };
  });
