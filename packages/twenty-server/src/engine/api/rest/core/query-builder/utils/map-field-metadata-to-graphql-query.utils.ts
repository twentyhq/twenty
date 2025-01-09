import { FieldMetadataType } from 'twenty-shared';

import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

const DEFAULT_DEPTH_VALUE = 1;

// TODO: Should be properly type and based on composite type definitions
export const mapFieldMetadataToGraphqlQuery = (
  objectMetadataItems,
  field,
  maxDepthForRelations = DEFAULT_DEPTH_VALUE,
): string | undefined => {
  if (maxDepthForRelations < 0) {
    return '';
  }

  const fieldType = field.type;

  const fieldIsSimpleValue = [
    FieldMetadataType.UUID,
    FieldMetadataType.TEXT,
    FieldMetadataType.DATE_TIME,
    FieldMetadataType.DATE,
    FieldMetadataType.BOOLEAN,
    FieldMetadataType.NUMBER,
    FieldMetadataType.NUMERIC,
    FieldMetadataType.RATING,
    FieldMetadataType.SELECT,
    FieldMetadataType.MULTI_SELECT,
    FieldMetadataType.POSITION,
    FieldMetadataType.RAW_JSON,
    FieldMetadataType.RICH_TEXT,
    FieldMetadataType.ARRAY,
    FieldMetadataType.TS_VECTOR,
  ].includes(fieldType);

  if (fieldIsSimpleValue) {
    return field.name;
  } else if (
    maxDepthForRelations > 0 &&
    fieldType === FieldMetadataType.RELATION &&
    field.toRelationMetadata?.relationType === RelationMetadataType.ONE_TO_MANY
  ) {
    const relationMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        (field.toRelationMetadata as any)?.fromObjectMetadataId,
    );

    return `${field.name}
    {
      id
      ${(relationMetadataItem?.fields ?? [])
        .map((field) =>
          mapFieldMetadataToGraphqlQuery(
            objectMetadataItems,
            field,
            maxDepthForRelations - 1,
          ),
        )
        .join('\n')}
    }`;
  } else if (
    maxDepthForRelations > 0 &&
    fieldType === FieldMetadataType.RELATION &&
    field.fromRelationMetadata?.relationType ===
      RelationMetadataType.ONE_TO_MANY
  ) {
    const relationMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        (field.fromRelationMetadata as any)?.toObjectMetadataId,
    );

    return `${field.name}
      {
        edges {
          node {
            id
            ${(relationMetadataItem?.fields ?? [])
              .map((field) =>
                mapFieldMetadataToGraphqlQuery(
                  objectMetadataItems,
                  field,
                  maxDepthForRelations - 1,
                ),
              )
              .join('\n')}
          }
        }
      }`;
  } else if (fieldType === FieldMetadataType.LINKS) {
    return `
      ${field.name}
      {
        primaryLinkLabel
        primaryLinkUrl
        secondaryLinks
      }
    `;
  } else if (fieldType === FieldMetadataType.CURRENCY) {
    return `
      ${field.name}
      {
        amountMicros
        currencyCode
      }
    `;
  } else if (fieldType === FieldMetadataType.FULL_NAME) {
    return `
      ${field.name}
      {
        firstName
        lastName
      }
    `;
  } else if (fieldType === FieldMetadataType.ADDRESS) {
    return `
      ${field.name}
      {
        addressStreet1
        addressStreet2
        addressCity
        addressPostcode
        addressState
        addressCountry
        addressLat
        addressLng
      }
    `;
  } else if (fieldType === FieldMetadataType.ACTOR) {
    return `
      ${field.name}
      {
        source
        workspaceMemberId
        name
      }
    `;
  } else if (fieldType === FieldMetadataType.EMAILS) {
    return `
      ${field.name}
      {
        primaryEmail
        additionalEmails
      }
    `;
  } else if (fieldType === FieldMetadataType.PHONES) {
    return `
      ${field.name}
      {
        primaryPhoneNumber
        primaryPhoneCountryCode
        primaryPhoneCallingCode
        additionalPhones
      }
    `;
  }
};
