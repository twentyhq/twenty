import { useApolloClient } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import { v4 } from 'uuid';

import { useOptimisticEffect } from '@/apollo/optimistic-effect/hooks/useOptimisticEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useGenerateEmptyRecord } from '@/object-record/hooks/useGenerateEmptyRecord';
import { capitalize } from '~/utils/string/capitalize';

type useCreateOneRecordProps = {
  objectNameSingular: string;
  refetchFindManyQuery?: boolean;
};

export const useCreateOneRecord = <T>({
  objectNameSingular,
  refetchFindManyQuery = false,
}: useCreateOneRecordProps) => {
  const { triggerOptimisticEffects } = useOptimisticEffect({
    objectNameSingular,
  });

  const { objectMetadataItem, createOneRecordMutation, findManyRecordsQuery } =
    useObjectMetadataItem({
      objectNameSingular,
    });

  // TODO: type this with a minimal type at least with Record<string, any>
  const apolloClient = useApolloClient();

  const { generateEmptyRecord } = useGenerateEmptyRecord({
    objectMetadataItem,
  });

  const createOneRecord = async (input: Record<string, any>) => {
    const recordId = v4();

    const generatedEmptyRecord = generateEmptyRecord({
      id: recordId,
      ...input,
    });

    if (generatedEmptyRecord) {
      triggerOptimisticEffects(
        `${capitalize(objectMetadataItem.nameSingular)}Edge`,
        generatedEmptyRecord,
      );
    }

    const createdObject = await apolloClient.mutate({
      mutation: createOneRecordMutation,
      variables: {
        input: { id: recordId, ...input },
      },
      optimisticResponse: {
        [`create${capitalize(objectMetadataItem.nameSingular)}`]:
          generateEmptyRecord({ id: recordId, ...input }),
      },
      refetchQueries: refetchFindManyQuery
        ? [getOperationName(findManyRecordsQuery) ?? '']
        : [],
    });

    if (!createdObject.data) {
      return null;
    }

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
