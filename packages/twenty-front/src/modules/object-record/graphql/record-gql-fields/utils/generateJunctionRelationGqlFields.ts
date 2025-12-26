import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from 'twenty-shared/types';

type GenerateJunctionRelationGqlFieldsArgs = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItems: ObjectMetadataItem[];
};

// Generates GraphQL fields for a junction relation, including the nested target objects
// This is similar to generateActivityTargetGqlFields but for generic junction relations
export const generateJunctionRelationGqlFields = ({
  fieldMetadataItem,
  objectMetadataItems,
}: GenerateJunctionRelationGqlFieldsArgs): RecordGqlFields | null => {
  const settings = fieldMetadataItem.settings as {
    junctionTargetRelationFieldIds?: string[];
  };

  if (
    !isDefined(settings?.junctionTargetRelationFieldIds) ||
    settings.junctionTargetRelationFieldIds.length === 0
  ) {
    return null;
  }

  // Find the junction object metadata (target of the ONE_TO_MANY relation)
  const junctionObjectMetadata = objectMetadataItems.find(
    (item) => item.id === fieldMetadataItem.relation?.targetObjectMetadata.id,
  );

  if (!isDefined(junctionObjectMetadata)) {
    return null;
  }

  // Build fields for each junction target relation
  const junctionTargetFields: RecordGqlFields = {};

  for (const targetFieldId of settings.junctionTargetRelationFieldIds) {
    const targetField = junctionObjectMetadata.fields.find(
      (field) => field.id === targetFieldId,
    );

    if (
      !isDefined(targetField) ||
      targetField.type !== FieldMetadataType.RELATION ||
      !isDefined(targetField.relation)
    ) {
      continue;
    }

    // Get the actual target object metadata
    const targetObjectMetadata = objectMetadataItems.find(
      (item) => item.id === targetField.relation?.targetObjectMetadata.id,
    );

    if (!isDefined(targetObjectMetadata)) {
      continue;
    }

    const labelIdentifierFieldMetadataItem = getLabelIdentifierFieldMetadataItem(
      targetObjectMetadata,
    );

    // Include the nested target object with its identifier fields
    junctionTargetFields[targetField.name] = {
      id: true,
      ...(isDefined(labelIdentifierFieldMetadataItem)
        ? { [labelIdentifierFieldMetadataItem.name]: true }
        : {}),
    };
  }

  // Get the junction object's label identifier
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

// Check if a field is a junction relation (has junctionTargetRelationFieldIds configured)
export const isJunctionRelationField = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'settings'>,
): boolean => {
  if (fieldMetadataItem.type !== FieldMetadataType.RELATION) {
    return false;
  }

  const settings = fieldMetadataItem.settings as {
    junctionTargetRelationFieldIds?: string[];
  };

  return (
    isDefined(settings?.junctionTargetRelationFieldIds) &&
    settings.junctionTargetRelationFieldIds.length > 0
  );
};

