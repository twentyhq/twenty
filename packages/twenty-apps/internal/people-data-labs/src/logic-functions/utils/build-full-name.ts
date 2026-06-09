import { toText } from 'src/logic-functions/utils/to-text';
import { type FullNameValue } from 'src/types/full-name-value';
import { isDefined } from 'src/utils/is-defined';

const WHITESPACE_REGEX = /\s+/;

export const buildFullName = ({
  firstName,
  lastName,
  fullName,
}: {
  firstName: unknown;
  lastName: unknown;
  fullName: unknown;
}): FullNameValue | undefined => {
  const first = toText(firstName);
  const last = toText(lastName);

  if (isDefined(first) || isDefined(last)) {
    return { firstName: first ?? '', lastName: last ?? '' };
  }

  const full = toText(fullName);
  if (!isDefined(full)) {
    return undefined;
  }

  const [head, ...rest] = full.split(WHITESPACE_REGEX);

  return { firstName: head, lastName: rest.join(' ') };
};
