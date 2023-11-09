import { useMutation } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';

import { Currency, FieldMetadataType } from '~/generated-metadata/graphql';

import { ObjectMetadataItemIdentifier } from '../types/ObjectMetadataItemIdentifier';

import { useFindOneObjectMetadataItem } from './useFindOneObjectMetadataItem';

const defaultFieldValues: Record<FieldMetadataType, unknown> = {
  [FieldMetadataType.Money]: { amount: null, currency: Currency.Usd },
  [FieldMetadataType.Boolean]: false,
  [FieldMetadataType.Date]: null,
  [FieldMetadataType.Email]: '',
  [FieldMetadataType.Enum]: null,
  [FieldMetadataType.Number]: null,
  [FieldMetadataType.Relation]: null,
  [FieldMetadataType.Phone]: '',
  [FieldMetadataType.Text]: '',
  [FieldMetadataType.Url]: { link: '', text: '' },
  [FieldMetadataType.Uuid]: '',
};

export const useCreateOneObject = ({
  objectNamePlural,
}: Pick<ObjectMetadataItemIdentifier, 'objectNamePlural'>) => {
  const {
    foundObjectMetadataItem,
    objectNotFoundInMetadata,
    findManyQuery,
    createOneMutation,
  } = useFindOneObjectMetadataItem({
    objectNamePlural,
  });

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(createOneMutation);

  const createOneObject = foundObjectMetadataItem
    ? (input: Record<string, unknown> = {}) => {
        return mutate({
          variables: {
            input: {
              ...foundObjectMetadataItem.fields.reduce(
                (result, field) => ({
                  ...result,
                  [field.name]: defaultFieldValues[field.type],
                }),
                {},
              ),
              ...input,
            },
          },
          refetchQueries: [getOperationName(findManyQuery) ?? ''],
        });
      }
    : undefined;

  return {
    createOneObject,
    objectNotFoundInMetadata,
  };
};
