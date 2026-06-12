import { toText } from 'src/logic-functions/utils/to-text';
import { isDefined } from 'src/utils/is-defined';

export const buildPersonNameParam = ({
  firstName,
  lastName,
}: {
  firstName: unknown;
  lastName: unknown;
}): string | undefined => {
  const first = toText(firstName);
  const last = toText(lastName);

  if (!isDefined(first) || !isDefined(last)) {
    return undefined;
  }

  return `${first} ${last}`;
};
