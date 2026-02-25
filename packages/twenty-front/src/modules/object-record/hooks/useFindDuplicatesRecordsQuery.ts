import gql from 'graphql-tag';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isAggregationEnabled } from '@/object-metadata/utils/isAggregationEnabled';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getFindDuplicateRecordsQueryResponseField } from '@/object-record/utils/getFindDuplicateRecordsQueryResponseField';
import { capitalize } from 'twenty-shared/utils';

export const useFindDuplicateRecordsQuery = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);

  const findDuplicateRecordsQuery = gql`
    query FindDuplicate${capitalize(
      objectMetadataItem.nameSingular,
    )}($ids: [UUID!]!) {
      ${getFindDuplicateRecordsQueryResponseField(
        objectMetadataItem.nameSingular,
      )}(ids: $ids) {
        edges {
          node ${mapObjectMetadataToGraphQLQuery({
            objectMetadataItems,
            objectMetadataItem,
            objectPermissionsByObjectMetadataId,
          })}
          cursor
        }
        pageInfo {
          ${isAggregationEnabled(objectMetadataItem) ? 'hasNextPage' : ''}
          startCursor
          endCursor
        }
      }
    }
  `;

  return {
    findDuplicateRecordsQuery,
  };
};
