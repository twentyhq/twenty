import { FieldType } from '@/object-record/record-field/types/FieldType';
import { FieldMetadataType } from '~/generated/graphql';
import { capitalize } from '~/utils/string/capitalize';

export const generateEmptyFieldValueForClear = (
  fieldType: FieldType,
  relationType?: 'Single' | 'Many',
  relationManyNameSingular?: string, // TODO: refactor with relation refacto
) => {
  switch (fieldType) {
    case FieldMetadataType.Email:
    case FieldMetadataType.Phone:
    case FieldMetadataType.Text: {
      return '';
    }
    case FieldMetadataType.Link: {
      return {
        label: '',
        url: '',
        // __typename: 'Link',
      };
    }
    case FieldMetadataType.FullName: {
      return {
        firstName: '',
        lastName: '',
        // __typename: 'FullName',
      };
    }
    case FieldMetadataType.DateTime: {
      return null;
    }
    case FieldMetadataType.Number:
    case FieldMetadataType.Rating:
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
      if (relationType === 'Single') {
        return null;
      }

      return {
        __typename: relationManyNameSingular
          ? `${capitalize(relationManyNameSingular)}Connection`
          : '',
        edges: [],
      };
    }
    case FieldMetadataType.Currency: {
      return {
        amountMicros: null,
        currencyCode: null,
        // __typename: 'Currency',
      };
    }
    case FieldMetadataType.Select: {
      return null;
    }
    case FieldMetadataType.MultiSelect: {
      throw new Error('Not implemented yet');
    }
    default: {
      throw new Error('Unhandled FieldMetadataType');
    }
  }
};
