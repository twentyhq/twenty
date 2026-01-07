import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { isNonCompositeField } from '@/object-record/object-filter-dropdown/utils/isNonCompositeField';
import { type ObjectPermissions } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

type MapFieldMetadataToGraphQLQueryArgs = {
  objectMetadataItems: ObjectMetadataItem[];
  gqlField: string;
  fieldMetadata: Pick<
    FieldMetadataItem,
    'name' | 'type' | 'relation' | 'morphRelations' | 'settings'
  >;
  relationRecordGqlFields?: RecordGqlFields;
  computeReferences?: boolean;
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
};
// TODO: change ObjectMetadataItems mock before refactoring with relation computed field
export const mapFieldMetadataToGraphQLQuery = ({
  objectMetadataItems,
  gqlField,
  fieldMetadata,
  relationRecordGqlFields,
  computeReferences = false,
  objectPermissionsByObjectMetadataId,
}: MapFieldMetadataToGraphQLQueryArgs): string => {
  const fieldType = fieldMetadata.type;

  const fieldIsNonCompositeField = isNonCompositeField(fieldType);

  if (fieldIsNonCompositeField) {
    return gqlField;
  }

  // We could factorize morph relation fields mapping to be passing through the RELATION handler too as now they share
  // the same name and join column name logic
  if (
    fieldType === FieldMetadataType.MORPH_RELATION &&
    (fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY ||
      fieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE)
  ) {
    let gqlMorphField = '';
    for (const morphRelation of fieldMetadata.morphRelations ?? []) {
      const relationFieldName = computeMorphRelationFieldName({
        fieldName: fieldMetadata.name,
        relationType: fieldMetadata.settings?.relationType,
        targetObjectMetadataNameSingular:
          morphRelation.targetObjectMetadata.nameSingular,
        targetObjectMetadataNamePlural:
          morphRelation.targetObjectMetadata.namePlural,
      });
      const relationMetadataItem = objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.id === morphRelation.targetObjectMetadata.id,
      );

      if (!isDefined(relationMetadataItem)) {
        continue;
      }

      if (
        isDefined(objectPermissionsByObjectMetadataId) &&
        isDefined(relationMetadataItem.id)
      ) {
        if (!isDefined(morphRelation.targetObjectMetadata.id)) {
          throw new Error(
            `Target object metadata id not found with field metadata ${fieldMetadata.name}`,
          );
        }

        const objectPermission = getObjectPermissionsForObject(
          objectPermissionsByObjectMetadataId,
          morphRelation.targetObjectMetadata.id,
        );

        if (!objectPermission.canReadObjectRecords) {
          continue;
        }
      }

      if (fieldMetadata.settings?.relationType === RelationType.ONE_TO_MANY) {
        if (gqlField !== relationFieldName) {
          continue;
        }

        gqlMorphField += `${relationFieldName}
{
  edges {
    node ${mapObjectMetadataToGraphQLQuery({
      objectMetadataItems,
      objectMetadataItem: relationMetadataItem,
      recordGqlFields: relationRecordGqlFields,
      computeReferences,
      isRootLevel: false,
      objectPermissionsByObjectMetadataId,
    })}
  }
}`;
      }

      if (fieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE) {
        if (gqlField === `${relationFieldName}Id`) {
          gqlMorphField += `${gqlField}
    `;
          continue;
        }

        if (gqlField !== relationFieldName) {
          continue;
        }

        gqlMorphField += `${relationFieldName}
${mapObjectMetadataToGraphQLQuery({
  objectMetadataItems,
  objectMetadataItem: relationMetadataItem,
  recordGqlFields: relationRecordGqlFields,
  computeReferences,
  isRootLevel: false,
  objectPermissionsByObjectMetadataId,
})}`;
      }
    }
    return `${gqlMorphField}`;
  }

  if (
    fieldType === FieldMetadataType.RELATION &&
    fieldMetadata.relation?.type === RelationType.MANY_TO_ONE
  ) {
    const relationMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        fieldMetadata.relation?.targetObjectMetadata.id,
    );

    if (!isDefined(relationMetadataItem)) {
      return '';
    }

    if (
      isDefined(objectPermissionsByObjectMetadataId) &&
      isDefined(relationMetadataItem.id)
    ) {
      if (!isDefined(fieldMetadata.relation?.targetObjectMetadata.id)) {
        throw new Error(
          `Target object metadata id not found with field metadata ${fieldMetadata.name}`,
        );
      }

      const objectPermission = getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        fieldMetadata.relation?.targetObjectMetadata.id,
      );

      if (!objectPermission.canReadObjectRecords) {
        return '';
      }
    }

    if (gqlField === fieldMetadata.settings?.joinColumnName) {
      return `${gqlField}`;
    }

    return `${gqlField}
${mapObjectMetadataToGraphQLQuery({
  objectMetadataItems,
  objectMetadataItem: relationMetadataItem,
  recordGqlFields: relationRecordGqlFields,
  computeReferences: computeReferences,
  isRootLevel: false,
  objectPermissionsByObjectMetadataId,
})}`;
  }

  if (
    fieldType === FieldMetadataType.RELATION &&
    fieldMetadata.relation?.type === RelationType.ONE_TO_MANY
  ) {
    const relationMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        fieldMetadata.relation?.targetObjectMetadata.id,
    );

    if (!isDefined(relationMetadataItem)) {
      return '';
    }

    if (
      isDefined(objectPermissionsByObjectMetadataId) &&
      isDefined(relationMetadataItem.id)
    ) {
      if (!isDefined(fieldMetadata.relation?.targetObjectMetadata.id)) {
        throw new Error(
          `Target object metadata id not found with field metadata ${fieldMetadata.name}`,
        );
      }

      const objectPermission = getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        fieldMetadata.relation?.targetObjectMetadata.id,
      );

      if (!objectPermission.canReadObjectRecords) {
        return '';
      }
    }

    return `${gqlField}
{
  edges {
    node ${mapObjectMetadataToGraphQLQuery({
      objectMetadataItems,
      objectMetadataItem: relationMetadataItem,
      recordGqlFields: relationRecordGqlFields,
      computeReferences,
      isRootLevel: false,
      objectPermissionsByObjectMetadataId,
    })}
  }
}`;
  }

  if (fieldType === FieldMetadataType.LINKS) {
    return `${gqlField}
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks
}`;
  }

  if (fieldType === FieldMetadataType.CURRENCY) {
    return `${gqlField}
{
  amountMicros
  currencyCode
}
    `;
  }

  if (fieldType === FieldMetadataType.FULL_NAME) {
    return `${gqlField}
{
  firstName
  lastName
}`;
  }

  if (fieldType === FieldMetadataType.ADDRESS) {
    return `${gqlField}
{
  addressStreet1
  addressStreet2
  addressCity
  addressState
  addressCountry
  addressPostcode
  addressLat
  addressLng
}`;
  }

  if (fieldType === FieldMetadataType.ACTOR) {
    return `${gqlField}
{
    source
    workspaceMemberId
    name
    context
}`;
  }

  if (fieldType === FieldMetadataType.EMAILS) {
    return `${gqlField}
{
  primaryEmail
  additionalEmails
}`;
  }

  if (fieldType === FieldMetadataType.PHONES) {
    return `${gqlField}
    {
      primaryPhoneNumber
      primaryPhoneCountryCode
      primaryPhoneCallingCode
      additionalPhones
    }`;
  }

  if (fieldType === FieldMetadataType.RICH_TEXT_V2) {
    return `${gqlField}
{
  blocknote
  markdown
}`;
  }

  return '';
};
