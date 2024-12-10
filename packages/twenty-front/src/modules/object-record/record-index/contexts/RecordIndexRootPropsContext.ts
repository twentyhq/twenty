import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createRootPropsContext } from '~/utils/createRootPropsContext';

export type RecordIndexRootPropsContextProps = {
  indexIdentifierUrl: (recordId: string) => string;
  onIndexRecordsLoaded: () => void;
  objectNamePlural: string;
  objectNameSingular: string;
  objectMetadataItem: ObjectMetadataItem;
  recordIndexId: string;
};

export const [
  RecordIndexRootPropsContextProvider,
  useRecordIndexRootPropsContext,
] = createRootPropsContext<RecordIndexRootPropsContextProps>(
  'RecordIndexRootProps',
);
