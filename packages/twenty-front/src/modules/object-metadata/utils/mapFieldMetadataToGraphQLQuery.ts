import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { isUndefined } from '@sniptt/guards';
import {
  FieldMetadataType,
  ObjectPermission,
  RelationType,
} from '~/generated-metadata/graphql';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { isNonCompositeField } from '@/object-record/object-filter-dropdown/utils/isNonCompositeField';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataItem } from '../types/FieldMetadataItem';

type MapFieldMetadataToGraphQLQueryArgs = {
  objectMetadataItems: ObjectMetadataItem[];
  gqlField: string;
  fieldMetadata: Pick<
    FieldMetadataItem,
    'name' | 'type' | 'relation' | 'settings'
  >;
  relationRecordGqlFields?: RecordGqlFields;
  computeReferences?: boolean;
  objectPermissionsByObjectMetadataId: Record<string, ObjectPermission>;
  isFieldsPermissionsEnabled?: boolean;
};
// TODO: change ObjectMetadataItems mock before refactoring with relation computed field
export const mapFieldMetadataToGraphQLQuery = ({
  objectMetadataItems,
  gqlField,
  fieldMetadata,
  relationRecordGqlFields,
  computeReferences = false,
  objectPermissionsByObjectMetadataId,
  isFieldsPermissionsEnabled,
}: MapFieldMetadataToGraphQLQueryArgs): string => {
  const fieldType = fieldMetadata.type;

  const fieldIsNonCompositeField = isNonCompositeField(fieldType);

  if (fieldIsNonCompositeField) {
    return gqlField;
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

    if (isUndefined(relationMetadataItem)) {
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
  isFieldsPermissionsEnabled,
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

    if (isUndefined(relationMetadataItem)) {
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
      isFieldsPermissionsEnabled,
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
