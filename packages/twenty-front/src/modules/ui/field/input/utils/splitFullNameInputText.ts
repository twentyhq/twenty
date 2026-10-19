import { type FieldFullNameValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { splitFullName } from '~/utils/format/splitFullName';

export const splitFullNameInputText = (
  text: string,
  currentFirstName: string,
): FieldFullNameValue => {
  const trimmedText = text.trim();

  const shouldKeepCompoundFirstName =
    currentFirstName.includes(' ') &&
    (trimmedText === currentFirstName ||
      trimmedText.startsWith(`${currentFirstName} `));

  if (shouldKeepCompoundFirstName) {
    return {
      firstName: currentFirstName,
      lastName: trimmedText.slice(currentFirstName.length).trim(),
    };
  }

  const [firstName, lastName] = splitFullName(trimmedText);

  return { firstName, lastName };
};
