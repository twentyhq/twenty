import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const buildDuplicateEntryUserFriendlyMessage = ({
  objectLabel,
  fieldLabels,
  duplicateValue,
  isRestore,
}: {
  objectLabel: string;
  fieldLabels: string[];
  duplicateValue: string | undefined;
  isRestore: boolean;
}): MessageDescriptor => {
  const joinedFieldLabels = fieldLabels.join(', ');
  const conflictingFields = isDefined(duplicateValue)
    ? `${joinedFieldLabels} (${duplicateValue})`
    : joinedFieldLabels;

  return isRestore
    ? msg`Cannot restore: another ${objectLabel} already has the same ${conflictingFields}.`
    : msg`Another ${objectLabel} already has the same ${conflictingFields}.`;
};
