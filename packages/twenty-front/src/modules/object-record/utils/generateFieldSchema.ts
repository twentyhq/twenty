import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { generateRelationFieldSchema } from '@/object-record/utils/generateRelationFieldSchema';
import { FieldMetadataType } from '~/generated/graphql';

export const generateFieldSchema = ({
  fieldMetadataItem,
  objectMetadataItems,
}: {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'fromRelationMetadata' | 'toRelationMetadata' | 'type'
  >;
  objectMetadataItems: ObjectMetadataItem[];
}): z.ZodSchema => {
  switch (fieldMetadataItem.type) {
    case FieldMetadataType.Email: {
      return z.string().email().default('');
    }
    case FieldMetadataType.Phone:
    case FieldMetadataType.Text: {
      return z.string().default('');
    }
    case FieldMetadataType.Link: {
      return z.object({
        label: z.string().default(''),
        url: z.string().default(''),
        __typename: z.literal('Link').default('Link'),
      });
    }
    case FieldMetadataType.FullName: {
      return z.object({
        firstName: z.string().default(''),
        lastName: z.string().default(''),
        __typename: z.literal('FullName').default('FullName'),
      });
    }
    case FieldMetadataType.DateTime: {
      return z.string().datetime().nullable().default(null);
    }
    case FieldMetadataType.Number:
    case FieldMetadataType.Numeric: {
      return z.number().nullable().default(null);
    }
    case FieldMetadataType.Rating: {
      return z.string().nullable().default(null);
    }
    case FieldMetadataType.Uuid: {
      return z.string().uuid().nullable().default(null);
    }
    case FieldMetadataType.Boolean: {
      return z.boolean().default(true);
    }
    case FieldMetadataType.Relation: {
      return generateRelationFieldSchema({
        fieldMetadataItem,
        objectMetadataItems,
      });
    }
    case FieldMetadataType.Currency: {
      return z.object({
        amountMicros: z.number().int().nullable().default(null),
        currencyCode: z
          .nativeEnum(CurrencyCode)
          .or(z.string().length(0))
          .default(''),
        __typename: z.literal('Currency').default('Currency'),
      });
    }
    case FieldMetadataType.Select: {
      return z.string().nullable().default(null);
    }
    default: {
      return z.never({ invalid_type_error: 'Unhandled FieldMetadataType' });
    }
  }
};
