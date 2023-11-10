import { useMutation } from '@apollo/client';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { Currency, FieldMetadataType } from '~/generated-metadata/graphql';
import { capitalize } from '~/utils/string/capitalize';

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

export const useCreateOneObjectRecord = ({
  objectNamePlural,
}: Pick<ObjectMetadataItemIdentifier, 'objectNamePlural'>) => {
  const { triggerOptimisticEffects } = useOptimisticEffect();

  const {
    foundObjectMetadataItem,
    objectNotFoundInMetadata,
    createOneMutation,
  } = useFindOneObjectMetadataItem({
    objectNamePlural,
  });

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(createOneMutation);

  const createOneObject = foundObjectMetadataItem
    ? async (input: Record<string, any>) => {
        const createdObject = await mutate({
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
        });

        triggerOptimisticEffects(
          `${capitalize(foundObjectMetadataItem.nameSingular)}Edge`,
          createdObject.data[
            `create${capitalize(foundObjectMetadataItem.nameSingular)}`
          ],
        );
      }
    : undefined;

  return {
    createOneObject,
    objectNotFoundInMetadata,
  };
};
