import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  FieldMetadataType,
  RelationDefinitionType,
} from '~/generated-metadata/graphql';

export const generateEmptyFieldValue = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'relationDefinition'>,
) => {
  switch (fieldMetadataItem.type) {
    case FieldMetadataType.TEXT: {
      return '';
    }
    case FieldMetadataType.EMAILS: {
      return { primaryEmail: '', additionalEmails: null };
    }
    case FieldMetadataType.LINKS: {
      return { primaryLinkUrl: '', primaryLinkLabel: '', secondaryLinks: [] };
    }
    case FieldMetadataType.FULL_NAME: {
      return {
        firstName: '',
        lastName: '',
      };
    }
    case FieldMetadataType.ADDRESS: {
      return {
        addressStreet1: '',
        addressStreet2: '',
        addressCity: '',
        addressState: '',
        addressCountry: '',
        addressPostcode: '',
        addressLat: null,
        addressLng: null,
      };
    }
    case FieldMetadataType.DATE_TIME: {
      return null;
    }
    case FieldMetadataType.DATE: {
      return null;
    }
    case FieldMetadataType.NUMBER:
    case FieldMetadataType.RATING:
    case FieldMetadataType.POSITION:
    case FieldMetadataType.NUMERIC: {
      return null;
    }
    case FieldMetadataType.UUID: {
      return null;
    }
    case FieldMetadataType.BOOLEAN: {
      return true;
    }
    case FieldMetadataType.RELATION: {
      if (
        fieldMetadataItem.relationDefinition?.direction ===
        RelationDefinitionType.MANY_TO_ONE
      ) {
        return null;
      }

      return [];
    }
    case FieldMetadataType.CURRENCY: {
      return {
        amountMicros: null,
        currencyCode: null,
      };
    }
    case FieldMetadataType.SELECT: {
      return null;
    }
    case FieldMetadataType.MULTI_SELECT: {
      return null;
    }
    case FieldMetadataType.ARRAY: {
      return null;
    }
    case FieldMetadataType.RAW_JSON: {
      return null;
    }
    case FieldMetadataType.RICH_TEXT: {
      return null;
    }
    case FieldMetadataType.RICH_TEXT_V2: {
      return {
        blocknote: null,
        markdown: null,
      };
    }
    case FieldMetadataType.ACTOR: {
      return {
        source: 'MANUAL',
        workspaceMemberId: null,
        name: '',
        context: {},
      };
    }
    case FieldMetadataType.PHONES: {
      return {
        primaryPhoneNumber: '',
        primaryPhoneCountryCode: '',
        primaryPhoneCallingCode: '',
        additionalPhones: null,
      };
    }
    default: {
      throw new Error('Unhandled FieldMetadataType');
    }
  }
};
