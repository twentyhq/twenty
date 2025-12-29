import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import {
  hasJunctionConfig,
  hasJunctionMorphId,
  hasJunctionTargetRelationFieldIds,
} from '@/object-record/record-field/ui/utils/isJunctionRelation';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type GenerateJunctionRelationGqlFieldsArgs = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
};

// Build GraphQL fields for a single morph field's target object
const buildMorphFieldTargetFields = (
  morphField: FieldMetadataItem,
  objectMetadataItems: ObjectMetadataItem[],
): RecordGqlFields => {
  const targetObjectMetadata = objectMetadataItems.find(
    (item) => item.id === morphField.relation?.targetObjectMetadata.id,
  );

  if (!isDefined(targetObjectMetadata)) {
    return {};
  }

  const labelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(targetObjectMetadata);

  return {
    [morphField.name]: {
      id: true,
      ...(isDefined(labelIdentifierFieldMetadataItem)
        ? { [labelIdentifierFieldMetadataItem.name]: true }
        : {}),
    },
  };
};

const buildRegularRelationFields = (
  targetField: FieldMetadataItem,
  objectMetadataItems: ObjectMetadataItem[],
): RecordGqlFields | null => {
  if (
    targetField.type !== FieldMetadataType.RELATION ||
    !isDefined(targetField.relation)
  ) {
    return null;
  }

  const targetObjectMetadata = objectMetadataItems.find(
    (item) => item.id === targetField.relation?.targetObjectMetadata.id,
  );

  if (!isDefined(targetObjectMetadata)) {
    return null;
  }

  const labelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(targetObjectMetadata);

  return {
    [targetField.name]: {
      id: true,
      ...(isDefined(labelIdentifierFieldMetadataItem)
        ? { [labelIdentifierFieldMetadataItem.name]: true }
        : {}),
    },
  };
};

// Generates GraphQL fields for a junction relation, including the nested target objects
// This is similar to generateActivityTargetGqlFields but for generic junction relations
export const generateJunctionRelationGqlFields = ({
  fieldMetadataItem,
  objectMetadataItems,
}: GenerateJunctionRelationGqlFieldsArgs): RecordGqlFields | null => {
  const settings = fieldMetadataItem.settings;

  if (!hasJunctionConfig(settings)) {
    return null;
  }

  const junctionObjectMetadata = objectMetadataItems.find(
    (item) => item.id === fieldMetadataItem.relation?.targetObjectMetadata.id,
  );

  if (!isDefined(junctionObjectMetadata)) {
    return null;
  }

  let junctionTargetFields: RecordGqlFields = {};

  // Handle morph-based junction (junctionMorphId)
  if (hasJunctionMorphId(settings)) {
    const morphFields = junctionObjectMetadata.fields.filter(
      (field) => field.morphId === settings.junctionMorphId,
    );

    for (const morphField of morphFields) {
      Object.assign(
        junctionTargetFields,
        buildMorphFieldTargetFields(morphField, objectMetadataItems),
      );
    }
  }

  // Handle field ID-based junction (junctionTargetRelationFieldIds)
  if (hasJunctionTargetRelationFieldIds(settings)) {
    for (const targetFieldId of settings.junctionTargetRelationFieldIds) {
      const targetField = junctionObjectMetadata.fields.find(
        (field) => field.id === targetFieldId,
      );

      if (!isDefined(targetField)) {
        continue;
      }

      // For MORPH_RELATION fields referenced by ID, build fields for their target
      if (targetField.type === FieldMetadataType.MORPH_RELATION) {
        Object.assign(
          junctionTargetFields,
          buildMorphFieldTargetFields(targetField, objectMetadataItems),
        );
        continue;
      }

      const regularFields = buildRegularRelationFields(
        targetField,
        objectMetadataItems,
      );

      if (isDefined(regularFields)) {
        Object.assign(junctionTargetFields, regularFields);
      }
    }
  }

  const junctionLabelIdentifierFieldMetadataItem =
    getLabelIdentifierFieldMetadataItem(junctionObjectMetadata);

  return {
    id: true,
    ...(isDefined(junctionLabelIdentifierFieldMetadataItem)
      ? { [junctionLabelIdentifierFieldMetadataItem.name]: true }
      : {}),
    ...junctionTargetFields,
  };
};

// Check if a field is a junction relation (has junction config)
export const isJunctionRelationField = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'settings'>,
): boolean => {
  if (fieldMetadataItem.type !== FieldMetadataType.RELATION) {
    return false;
  }

  return hasJunctionConfig(fieldMetadataItem.settings);
};
