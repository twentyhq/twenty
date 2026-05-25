import { ContextStorePageType } from 'twenty-shared/types';

export const getPageType = ({
  isSettingsPage,
  isRecordShowPage,
  isRecordIndexPage,
  isStandalonePage,
}: {
  isSettingsPage: boolean;
  isRecordShowPage: boolean;
  isRecordIndexPage: boolean;
  isStandalonePage: boolean;
}): ContextStorePageType | null => {
  if (isSettingsPage) {
    return ContextStorePageType.Settings;
  }

  if (isRecordIndexPage) {
    return ContextStorePageType.Index;
  }

  if (isRecordShowPage) {
    return ContextStorePageType.Record;
  }

  if (isStandalonePage) {
    return ContextStorePageType.Standalone;
  }

  return null;
};
