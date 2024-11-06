import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createRootPropsContext } from '~/utils/createRootPropsContext';

export type RecordIndexRootPropsContextProps = {
  indexIdentifierUrl: (recordId: string) => string;
  onIndexRecordsLoaded: () => void;
  onCreateRecord: () => void;
  objectNamePlural: string;
  objectNameSingular: string;
  objectMetadataItem: ObjectMetadataItem;
  recordIndexId: string;
};

export const RecordIndexRootPropsContext =
  createRootPropsContext<RecordIndexRootPropsContextProps>();
