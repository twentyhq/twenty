import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { createState } from 'twenty-ui/utilities';

export const commandMenuNavigationRecordsState = createState<
  {
    objectMetadataItem: ObjectMetadataItem;
    record: ObjectRecord;
  }[]
>({
  key: 'command-menu/commandMenuNavigationRecordsState',
  defaultValue: [],
});
