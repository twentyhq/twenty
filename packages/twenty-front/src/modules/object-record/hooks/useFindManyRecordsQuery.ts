import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import {
  generateFindManyRecordsQuery,
  type QueryCursorDirection,
} from '@/object-record/utils/generateFindManyRecordsQuery';

export const useFindManyRecordsQuery = ({
  objectNameSingular,
  recordGqlFields,
  computeReferences,
  cursorDirection = 'after',
}: {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  computeReferences?: boolean;
  cursorDirection?: QueryCursorDirection;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const findManyRecordsQuery = generateFindManyRecordsQuery({
    objectMetadataItem,
    objectMetadataItems,
    recordGqlFields,
    computeReferences,
    cursorDirection,
    objectPermissionsByObjectMetadataId,
  });

  return {
    findManyRecordsQuery,
  };
};
