import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';
import {
  type QueryCursorDirection,
  type RecordGqlOperationGqlRecordFields,
} from 'twenty-shared/types';

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

  const objectMetadataItems = useRecoilValueV2(objectMetadataItemsState);

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
