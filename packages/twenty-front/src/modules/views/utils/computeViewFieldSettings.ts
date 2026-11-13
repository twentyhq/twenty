import { parseRecordLimitInput } from '@/views/utils/parseRecordLimitInput';
import { isNonEmptyString } from '@sniptt/guards';
import { type ViewFieldSettings } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const computeViewFieldSettings = ({
  label,
  recordLimit,
}: {
  label: string;
  recordLimit: string;
}): ViewFieldSettings | null => {
  const trimmedLabel = label.trim();
  const parsedRecordLimit = parseRecordLimitInput(recordLimit);

  const settings: ViewFieldSettings = {
    ...(isNonEmptyString(trimmedLabel) ? { label: trimmedLabel } : {}),
    ...(parsedRecordLimit.isValid && isDefined(parsedRecordLimit.recordLimit)
      ? { recordLimit: parsedRecordLimit.recordLimit }
      : {}),
  };

  return Object.keys(settings).length > 0 ? settings : null;
};
