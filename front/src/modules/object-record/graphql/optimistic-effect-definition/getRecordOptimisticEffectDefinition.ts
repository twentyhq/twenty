import { produce } from 'immer';

import { OptimisticEffectDefinition } from '@/apollo/optimistic-effect/types/OptimisticEffectDefinition';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { PaginatedObjectTypeResults } from '@/object-record/types/PaginatedObjectTypeResults';
import { capitalize } from '~/utils/string/capitalize';

export const getRecordOptimisticEffectDefinition = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) =>
  ({
    key: `record-create-optimistic-effect-definition-${objectMetadataItem.nameSingular}`,
    typename: `${capitalize(objectMetadataItem.nameSingular)}Edge`,
    resolver: ({
      currentData,
      newData,
    }: {
      currentData: unknown;
      newData: unknown;
    }) => {
      const newRecordPaginatedCacheField = produce<
        PaginatedObjectTypeResults<any>
      >(currentData as PaginatedObjectTypeResults<any>, (draft) => {
        if (!draft) {
          return {
            edges: [{ node: newData, cursor: '' }],
            pageInfo: {
              endCursor: '',
              hasNextPage: false,
              hasPreviousPage: false,
              startCursor: '',
            },
          };
        }

        draft.edges.unshift({ node: newData, cursor: '' });
      });

      return newRecordPaginatedCacheField;
    },
    isUsingFlexibleBackend: true,
    objectMetadataItem,
  } satisfies OptimisticEffectDefinition);
