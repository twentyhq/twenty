import { getAvatarType } from '@/object-metadata/utils/getAvatarType';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { BaseObjectRecord } from '@/object-record/types/BaseObjectRecord';
import { GlobalSearchRecord } from '~/generated/graphql';

export const formatGlobalSearchRecordAsSingleRecordPickerRecord = (
  searchRecord: GlobalSearchRecord,
): SingleRecordPickerRecord => {
  return {
    id: searchRecord.recordId,
    name: searchRecord.label,
    avatarUrl: searchRecord.imageUrl || undefined,
    avatarType: getAvatarType(searchRecord.objectSingularName),
    linkToShowPage:
      getBasePathToShowPage({
        objectNameSingular: searchRecord.objectSingularName,
      }) + searchRecord.recordId,
    record: {
      id: searchRecord.recordId,
    } as BaseObjectRecord,
  };
};
