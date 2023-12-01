import { useMutation } from '@apollo/client';
import { v4 } from 'uuid';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { capitalize } from '~/utils/string/capitalize';

export const useCreateOneRecord = <T>({
  objectNameSingular,
}: Pick<ObjectMetadataItemIdentifier, 'objectNameSingular'>) => {
  const { triggerOptimisticEffects } = useOptimisticEffect({
    objectNameSingular,
  });

  const {
    objectMetadataItem,
    objectMetadataItemNotFound,
    createOneRecordMutation,
  } = useObjectMetadataItem({
    objectNameSingular,
  });

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(createOneRecordMutation);

  const createOneRecord = async (input: Record<string, any>) => {
    if (!objectMetadataItem || !objectNameSingular) {
      return null;
    }

    const createdRecord = await mutate({
      variables: {
        input: { ...input, id: v4() },
      },
    });

    triggerOptimisticEffects(
      `${capitalize(objectNameSingular)}Edge`,
      createdRecord.data[`create${capitalize(objectNameSingular)}`],
    );
    return createdRecord.data[`create${capitalize(objectNameSingular)}`] as T;
  };

  return {
    createOneRecord,
    objectMetadataItemNotFound,
  };
};
