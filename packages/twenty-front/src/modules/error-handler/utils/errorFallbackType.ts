import { AppPath } from '@/types/AppPath';

export enum ErrorFallbackType {
  Settings = 'settings',
  RecordShow = 'recordShow',
  RecordIndex = 'recordIndex',
  Default = 'default',
}

export const getErrorFallbackType = (pathname: string): ErrorFallbackType => {
  if (pathname.startsWith(`/${AppPath.Settings}`)) {
    return ErrorFallbackType.Settings;
  }

  if (pathname.startsWith(AppPath.RecordIndexPage.split('/:')[0])) {
    return ErrorFallbackType.RecordIndex;
  }

  if (pathname.startsWith(AppPath.RecordShowPage.split('/:')[0])) {
    return ErrorFallbackType.RecordShow;
  }

  return ErrorFallbackType.Default;
};
