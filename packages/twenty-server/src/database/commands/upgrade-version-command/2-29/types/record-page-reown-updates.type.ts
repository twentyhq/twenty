import { type ViewKey } from 'twenty-shared/types';

export type RecordPageReownUpdate = {
  id: string;
  update: {
    universalIdentifier?: string;
    isSystemSideEffect?: boolean;
    key?: ViewKey;
    applicationId?: string;
  };
};

export type RecordPageReownUpdates = {
  pageLayoutUpdates: RecordPageReownUpdate[];
  pageLayoutTabUpdates: RecordPageReownUpdate[];
  pageLayoutWidgetUpdates: RecordPageReownUpdate[];
  viewUpdates: RecordPageReownUpdate[];
  viewFieldUpdates: RecordPageReownUpdate[];
  viewFieldGroupUpdates: RecordPageReownUpdate[];
};
