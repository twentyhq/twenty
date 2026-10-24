import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isNonEmptyString } from '@sniptt/guards';
import { splitFullName } from '~/utils/format/splitFullName';

export const splitFullNameInputText = ({
  text,
  currentFullName,
}: {
  text: string;
  currentFullName: FieldFullNameValue;
}): FieldFullNameValue => {
  const trimmedText = text.trim();
  const { firstName: currentFirstName, lastName: currentLastName } =
    currentFullName;

  const shouldKeepCompoundFirstName =
    isNonEmptyString(currentFirstName) &&
    currentFirstName.includes(' ') &&
    (trimmedText === currentFirstName ||
      trimmedText.startsWith(`${currentFirstName} `));

  if (shouldKeepCompoundFirstName) {
    return {
      firstName: currentFirstName,
      lastName: trimmedText.slice(currentFirstName.length).trim(),
    };
  }

  const shouldKeepSingleWordInLastName =
    !isNonEmptyString(currentFirstName) &&
    isNonEmptyString(currentLastName) &&
    !trimmedText.includes(' ');

  if (shouldKeepSingleWordInLastName) {
    return { firstName: '', lastName: trimmedText };
  }

  const [firstName, lastName] = splitFullName(trimmedText);

  return { firstName, lastName };
};
