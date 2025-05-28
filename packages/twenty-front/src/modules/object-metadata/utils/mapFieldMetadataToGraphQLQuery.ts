import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { isUndefined } from '@sniptt/guards';
import {
    FieldMetadataType,
    ObjectPermission,
    RelationDefinitionType,
} from '~/generated-metadata/graphql';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { isNonCompositeField } from '@/object-record/object-filter-dropdown/utils/isNonCompositeField';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataItem } from '../types/FieldMetadataItem';

type MapFieldMetadataToGraphQLQueryArgs = {
  objectMetadataItems: ObjectMetadataItem[];
  gqlField: string;
  fieldMetadata: Pick<
    FieldMetadataItem,
    'name' | 'type' | 'relationDefinition' | 'settings'
  >;
  relationRecordGqlFields?: RecordGqlFields;
  computeReferences?: boolean;
  objectPermissionsByObjectMetadataId?: Record<string, ObjectPermission>;
};
// TODO: change ObjectMetadataItems mock before refactoring with relationDefinition computed field
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

  if (
    fieldType === FieldMetadataType.RELATION &&
    fieldMetadata.relationDefinition?.direction ===
      RelationDefinitionType.MANY_TO_ONE
  ) {
    const relationMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        fieldMetadata.relationDefinition?.targetObjectMetadata.id,
    );

    if (isUndefined(relationMetadataItem)) {
      return '';
    }

    // Check if the target object has read permission
    if (
      objectPermissionsByObjectMetadataId &&
      isDefined(relationMetadataItem.id)
    ) {
      const objectPermission =
        objectPermissionsByObjectMetadataId[relationMetadataItem.id];
      if (objectPermission?.canReadObjectRecords === false) {
        return ''; // Skip this relation if no read permission
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
    fieldMetadata.relationDefinition?.direction ===
      RelationDefinitionType.ONE_TO_MANY
  ) {
    const relationMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        fieldMetadata.relationDefinition?.targetObjectMetadata.id,
    );

    if (isUndefined(relationMetadataItem)) {
      return '';
    }

    // Check if the target object has read permission
    if (
      objectPermissionsByObjectMetadataId &&
      isDefined(relationMetadataItem.id)
    ) {
      const objectPermission =
        objectPermissionsByObjectMetadataId[relationMetadataItem.id];
      if (objectPermission?.canReadObjectRecords === false) {
        return ''; // Skip this relation if no read permission
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
