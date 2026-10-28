import { isNonEmptyString } from '@sniptt/guards';
import { formatRecordReference } from 'twenty-shared/ai';

const UNRENDERABLE_LABEL_CHARACTERS_PATTERN = /[[\]\n]/;

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

  if (UNRENDERABLE_LABEL_CHARACTERS_PATTERN.test(label)) {
    throw new Error(
      `The inbox reference to ${objectNameSingular} ${recordId} has a label with brackets or line breaks, which the inbox cannot render.`,
    );
  }

  return formatRecordReference({
    objectNameSingular,
    recordId,
    displayName: label,
  });
};
