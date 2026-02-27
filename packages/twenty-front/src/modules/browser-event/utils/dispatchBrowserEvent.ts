import { isDefined } from 'twenty-shared/utils';

export const dispatchMetadataOperationBrowserEvent = <T>(
  eventName: string,
  detail?: T,
) => {
  if (isDefined(detail)) {
    window.dispatchEvent(new CustomEvent<T>(eventName, detail));
  } else {
    window.dispatchEvent(new CustomEvent(eventName));
  }
};
