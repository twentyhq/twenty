import gql from 'graphql-tag';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { getFindDuplicateRecordsQueryResponseField } from '@/object-record/utils/getFindDuplicateRecordsQueryResponseField';
import { capitalize } from '~/utils/string/capitalize';

export const useFindDuplicateRecordsQuery = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const shouldQueryCounts = !objectMetadataItem.isRemote;

  const findDuplicateRecordsQuery = gql`
    query FindDuplicate${capitalize(
      objectMetadataItem.nameSingular,
    )}($id: ID!) {
      ${getFindDuplicateRecordsQueryResponseField(
        objectMetadataItem.nameSingular,
      )}(id: $id) {
        edges {
          node ${mapObjectMetadataToGraphQLQuery({
            objectMetadataItems,
            objectMetadataItem,
          })}
          cursor
        }
        pageInfo {
          ${shouldQueryCounts ? 'hasNextPage' : ''}
          startCursor
          endCursor
        }
        ${shouldQueryCounts ? 'totalCount' : ''}
      }
    }
  `;

  return {
    findDuplicateRecordsQuery,
  };
};
