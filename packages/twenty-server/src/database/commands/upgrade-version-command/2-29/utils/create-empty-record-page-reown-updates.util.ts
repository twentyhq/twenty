import { type RecordPageReownUpdates } from 'src/database/commands/upgrade-version-command/2-29/types/record-page-reown-updates.type';

export const createEmptyRecordPageReownUpdates =
  (): RecordPageReownUpdates => ({
    pageLayoutUpdates: [],
    pageLayoutTabUpdates: [],
    pageLayoutWidgetUpdates: [],
    viewUpdates: [],
    viewFieldUpdates: [],
    viewFieldGroupUpdates: [],
  });
