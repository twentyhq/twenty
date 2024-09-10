import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCombinedFindManyRecords } from '@/object-record/multiple-objects/hooks/useCombinedFindManyRecords';
import { isNonEmptyArray } from '@sniptt/guards';

export const useLinkedObjectsTitle = (linkedObjectIds: string[]) => {
  const { loading } = useCombinedFindManyRecords({
    skip: !isNonEmptyArray(linkedObjectIds),
    operationSignatures: [
      {
        objectNameSingular: CoreObjectNameSingular.Task,
        variables: {
          filter: {
            id: {
              in: linkedObjectIds ?? [],
            },
          },
        },
        fields: {
          id: true,
          title: true,
        },
      },
      {
        objectNameSingular: CoreObjectNameSingular.Note,
        variables: {
          filter: {
            id: {
              in: linkedObjectIds ?? [],
            },
          },
        },
        fields: {
          id: true,
          title: true,
        },
      },
    ],
  });

  return {
    loading,
  };
};
