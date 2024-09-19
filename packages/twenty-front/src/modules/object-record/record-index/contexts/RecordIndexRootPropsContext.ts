import { createRootPropsContext } from '~/utils/createRootPropsContext';

export type RecordIndexRootPropsContextProps = {
  onIndexIdentifierClick: (recordId: string) => void;
  onIndexRecordsLoaded: () => void;
  onCreateRecord: () => void;
  objectNamePlural: string;
  objectNameSingular: string;
  recordIndexId: string;
};

export const RecordIndexRootPropsContext =
  createRootPropsContext<RecordIndexRootPropsContextProps>();
