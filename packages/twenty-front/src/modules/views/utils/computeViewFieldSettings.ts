import { type ViewFieldSettings } from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';

export const computeViewFieldSettings = ({
  label,
  recordLimit,
}: {
  label: string;
  recordLimit: string;
}): ViewFieldSettings | null => {
  const trimmedLabel = label.trim();
  const parsedRecordLimit = Number.parseInt(recordLimit, 10);

  const settings: ViewFieldSettings = {
    ...(isNonEmptyString(trimmedLabel) ? { label: trimmedLabel } : {}),
    ...(Number.isInteger(parsedRecordLimit) && parsedRecordLimit > 0
      ? { recordLimit: parsedRecordLimit }
      : {}),
  };

  return Object.keys(settings).length > 0 ? settings : null;
};
