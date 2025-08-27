import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { assertUnreachable } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

export type GenerateEmptyFieldValueArgs = {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'type' | 'settings' | 'defaultValue'
  >;
  shouldComputeFunctionDefaultValue?: boolean;
};
// TODO strictly type each fieldValue following their FieldMetadataType
export const generateEmptyFieldValue = ({
  fieldMetadataItem,
  shouldComputeFunctionDefaultValue = false,
}: GenerateEmptyFieldValueArgs) => {
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
      if (shouldComputeFunctionDefaultValue) {
        return new Date().toISOString();
      }
      return null;
    }
    case FieldMetadataType.DATE: {
      if (shouldComputeFunctionDefaultValue) {
        return new Date().toISOString();
      }
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
      return fieldMetadataItem?.defaultValue ?? true;
    }
    case FieldMetadataType.RELATION:
    case FieldMetadataType.MORPH_RELATION: {
      if (
        fieldMetadataItem.settings?.relationType === RelationType.MANY_TO_ONE
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
        context: {},
        name: '',
        workspaceMemberId: null,
      } satisfies FieldActorValue;
    }
    case FieldMetadataType.PHONES: {
      return {
        primaryPhoneNumber: '',
        primaryPhoneCountryCode: '',
        primaryPhoneCallingCode: '',
        additionalPhones: null,
      };
    }
    case FieldMetadataType.TS_VECTOR: {
      return null;
    }
    default: {
      return assertUnreachable(
        fieldMetadataItem.type,
        'Unhandled FieldMetadataType',
      );
    }
  }
};
