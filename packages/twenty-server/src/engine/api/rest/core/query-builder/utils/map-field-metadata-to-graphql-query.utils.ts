import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

const DEFAULT_DEPTH_VALUE = 1;

// TODO: Should be properly type and based on composite type definitions
export const mapFieldMetadataToGraphqlQuery = (
  objectMetadataMaps: ObjectMetadataMaps,
  field: FieldMetadataEntity,
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

  const isRelation =
    isFieldMetadataEntityOfType(field, FieldMetadataType.RELATION) ||
    isFieldMetadataEntityOfType(field, FieldMetadataType.MORPH_RELATION);

  if (fieldIsSimpleValue) {
    return field.name;
  } else if (
    maxDepthForRelations > 0 &&
    isRelation &&
    field.settings?.relationType === RelationType.MANY_TO_ONE
  ) {
    const targetObjectMetadataId = field.relationTargetObjectMetadataId;

    if (!targetObjectMetadataId) {
      return '';
    }

    const relationMetadataItem =
      objectMetadataMaps.byId[targetObjectMetadataId];

    if (!isDefined(relationMetadataItem)) {
      return '';
    }

    return `${field.name}
    {
      id
      ${Object.values(relationMetadataItem.fieldsById)
        .map((field) =>
          mapFieldMetadataToGraphqlQuery(
            objectMetadataMaps,
            field,
            maxDepthForRelations - 1,
          ),
        )
        .join('\n')}
    }`;
  } else if (
    maxDepthForRelations > 0 &&
    isRelation &&
    field.settings?.relationType === RelationType.ONE_TO_MANY
  ) {
    const targetObjectMetadataId = field.relationTargetObjectMetadataId;

    if (!targetObjectMetadataId) {
      return '';
    }
    const relationMetadataItem =
      objectMetadataMaps.byId[targetObjectMetadataId];

    if (!relationMetadataItem) {
      return '';
    }

    return `${field.name}
      {
        edges {
          node {
            id
            ${Object.values(relationMetadataItem.fieldsById)
              .map((field) =>
                mapFieldMetadataToGraphqlQuery(
                  objectMetadataMaps,
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
  } else if (fieldType === FieldMetadataType.RICH_TEXT_V2) {
    return `
      ${field.name}
      {
        blocknote
        markdown
      }
    `;
  }
};
