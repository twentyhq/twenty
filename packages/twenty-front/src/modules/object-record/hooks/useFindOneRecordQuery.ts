import gql from 'graphql-tag';
import { useMemo } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { type RecordGqlOperationGqlRecordFields } from 'twenty-shared/types';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { capitalize } from 'twenty-shared/utils';

export const useFindOneRecordQuery = ({
  objectNameSingular,
  recordGqlFields,
  withSoftDeleted = false,
}: {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  withSoftDeleted?: boolean;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const findOneRecordQuery = useMemo(
    () => gql`
      query FindOne${capitalize(
        objectMetadataItem.nameSingular,
      )}($objectRecordId: UUID!) {
        ${objectMetadataItem.nameSingular}(filter: {
        ${
          withSoftDeleted
            ? `
          or: [
            { deletedAt: { is: NULL } },
            { deletedAt: { is: NOT_NULL } }
          ],
        `
            : ''
        }
          id: {
            eq: $objectRecordId
          }
        })${mapObjectMetadataToGraphQLQuery({
          objectMetadataItems,
          objectMetadataItem,
          recordGqlFields,
          objectPermissionsByObjectMetadataId,
        })}
      },
  `,
    [
      objectMetadataItem,
      objectMetadataItems,
      recordGqlFields,
      withSoftDeleted,
      objectPermissionsByObjectMetadataId,
    ],
  );

  return {
    findOneRecordQuery,
  };
};
