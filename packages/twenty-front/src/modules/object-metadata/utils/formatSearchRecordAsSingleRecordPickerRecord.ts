import { getAvatarType } from '@/object-metadata/utils/getAvatarType';
import { getBasePathToShowPage } from '@/object-metadata/utils/getBasePathToShowPage';
import { SingleRecordPickerRecord } from '@/object-record/record-picker/single-record-picker/types/SingleRecordPickerRecord';
import { SearchRecord } from '~/generated/graphql';

export const formatSearchRecordAsSingleRecordPickerRecord = (
  searchRecord: SearchRecord,
): SingleRecordPickerRecord => {
  return {
    id: searchRecord.recordId,
    name: searchRecord.label,
    avatarUrl: searchRecord.imageUrl ?? undefined,
    avatarType: getAvatarType(searchRecord.objectNameSingular),
    linkToShowPage:
      getBasePathToShowPage({
        objectNameSingular: searchRecord.objectNameSingular,
      }) + searchRecord.recordId,
    record: {
      id: searchRecord.recordId,
      __typename: searchRecord.objectNameSingular,
    },
  };
};
