import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createRootPropsContext } from '~/utils/createRootPropsContext';

export type RecordIndexRootPropsContextProps = {
  onIndexIdentifierClick: (recordId: string) => void;
  onIndexRecordsLoaded: () => void;
  onCreateRecord: () => void;
  objectNamePlural: string;
  objectNameSingular: string;
  objectMetadataItem: ObjectMetadataItem;
  recordIndexId: string;
};

export const RecordIndexRootPropsContext =
  createRootPropsContext<RecordIndexRootPropsContextProps>();
