import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  FieldMetadataType,
  RelationDefinitionType,
} from '~/generated-metadata/graphql';

export const generateEmptyFieldValue = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'relationDefinition'>,
) => {
  switch (fieldMetadataItem.type) {
    case FieldMetadataType.Text: {
      return '';
    }
    case FieldMetadataType.Emails: {
      return { primaryEmail: '', additionalEmails: null };
    }
    case FieldMetadataType.Links: {
      return { primaryLinkUrl: '', primaryLinkLabel: '', secondaryLinks: [] };
    }
    case FieldMetadataType.FullName: {
      return {
        firstName: '',
        lastName: '',
      };
    }
    case FieldMetadataType.Address: {
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
    case FieldMetadataType.DateTime: {
      return null;
    }
    case FieldMetadataType.Date: {
      return null;
    }
    case FieldMetadataType.Number:
    case FieldMetadataType.Rating:
    case FieldMetadataType.Position:
    case FieldMetadataType.Numeric: {
      return null;
    }
    case FieldMetadataType.Uuid: {
      return null;
    }
    case FieldMetadataType.Boolean: {
      return true;
    }
    case FieldMetadataType.Relation: {
      if (
        fieldMetadataItem.relationDefinition?.direction ===
        RelationDefinitionType.ManyToOne
      ) {
        return null;
      }

      return [];
    }
    case FieldMetadataType.Currency: {
      return {
        amountMicros: null,
        currencyCode: null,
      };
    }
    case FieldMetadataType.Select: {
      return null;
    }
    case FieldMetadataType.MultiSelect: {
      return null;
    }
    case FieldMetadataType.Array: {
      return null;
    }
    case FieldMetadataType.RawJson: {
      return null;
    }
    case FieldMetadataType.RichText: {
      return null;
    }
    case FieldMetadataType.Actor: {
      return {
        source: 'MANUAL',
        workspaceMemberId: null,
        name: '',
      };
    }
    case FieldMetadataType.Phones: {
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
