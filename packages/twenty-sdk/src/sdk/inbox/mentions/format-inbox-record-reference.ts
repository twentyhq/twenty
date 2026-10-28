import { isNonEmptyString } from '@sniptt/guards';
import { formatRecordReference } from 'twenty-shared/ai';

export const formatInboxRecordReference = ({
  objectNameSingular,
  recordId,
  label,
}: {
  objectNameSingular: string;
  recordId: string;
  label: string;
}): string => {
  if (!isNonEmptyString(label.trim())) {
    throw new Error(
      `The inbox reference to ${objectNameSingular} ${recordId} needs a label, because the inbox shows labels as written.`,
    );
  }

  return formatRecordReference({
    objectNameSingular,
    recordId,
    displayName: label,
  });
};
