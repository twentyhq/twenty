import { useMutation } from '@apollo/client';
import { v4 } from 'uuid';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useFindOneObjectMetadataItem } from '@/object-metadata/hooks/useFindOneObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { CurrencyCode, FieldMetadataType } from '~/generated-metadata/graphql';
import { capitalize } from '~/utils/string/capitalize';

const defaultFieldValues: Record<FieldMetadataType, unknown> = {
  [FieldMetadataType.Currency]: {
    amountMicros: null,
    currencyCode: CurrencyCode.Usd,
  },
  [FieldMetadataType.Boolean]: false,
  [FieldMetadataType.Date]: null,
  [FieldMetadataType.Email]: '',
  [FieldMetadataType.Enum]: null,
  [FieldMetadataType.Number]: null,
  [FieldMetadataType.Probability]: null,
  [FieldMetadataType.Relation]: null,
  [FieldMetadataType.Phone]: '',
  [FieldMetadataType.Text]: '',
  [FieldMetadataType.Link]: { url: '', label: '' },
  [FieldMetadataType.Uuid]: '',
};

export const useCreateOneObjectRecord = ({
  objectNamePlural,
}: Pick<ObjectMetadataItemIdentifier, 'objectNamePlural'>) => {
  const { triggerOptimisticEffects } = useOptimisticEffect('CompanyV2');

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
            input: { ...input, id: v4() },
          },
        });

        triggerOptimisticEffects(
          `${capitalize(foundObjectMetadataItem.nameSingular)}Edge`,
          createdObject.data[
            `create${capitalize(foundObjectMetadataItem.nameSingular)}`
          ],
        );
        return createdObject.data;
      }
    : undefined;

  return {
    createOneObject,
    objectNotFoundInMetadata,
  };
};
