import { useMutation } from '@apollo/client';
import { v4 } from 'uuid';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { useGenerateEmptyRecord } from '@/object-record/hooks/useGenerateEmptyRecord';
import { capitalize } from '~/utils/string/capitalize';

export const useCreateOneRecord = <T>({
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const { triggerOptimisticEffects } = useOptimisticEffect({
    objectNameSingular,
  });

  const { objectMetadataItem, createOneRecordMutation } = useObjectMetadataItem(
    {
      objectNameSingular,
    },
  );

  // TODO: type this with a minimal type at least with Record<string, any>
  const [mutate] = useMutation(createOneRecordMutation);

  const { generateEmptyRecord } = useGenerateEmptyRecord({
    objectMetadataItem,
  });

  const createOneRecord = async (input: Record<string, any>) => {
    const recordId = v4();

    triggerOptimisticEffects(
      `${capitalize(objectMetadataItem.nameSingular)}Edge`,
      generateEmptyRecord(recordId),
    );

    const createdObject = await mutate({
      variables: {
        input: { ...input, id: recordId },
      },
      optimisticResponse: {
        [`create${capitalize(objectMetadataItem.nameSingular)}`]:
          generateEmptyRecord(recordId),
      },
    });

    triggerOptimisticEffects(
      `${capitalize(objectMetadataItem.nameSingular)}Edge`,
      createdObject.data[
        `create${capitalize(objectMetadataItem.nameSingular)}`
      ],
    );

    return createdObject.data[
      `create${capitalize(objectMetadataItem.nameSingular)}`
    ] as T;
  };

  return {
    createOneRecord,
  };
};
