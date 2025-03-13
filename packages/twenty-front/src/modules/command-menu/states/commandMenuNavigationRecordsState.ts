import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createState } from '@ui/utilities/state/utils/createState';

export const commandMenuNavigationRecordsState = createState<
  {
    objectMetadataItem: ObjectMetadataItem;
    record: ObjectRecord;
  }[]
>({
  key: 'command-menu/commandMenuNavigationRecordsState',
  defaultValue: [],
});
