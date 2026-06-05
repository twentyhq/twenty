import { toText } from 'src/logic-functions/utils/to-text';
import { isDefined } from 'src/utils/is-defined';

const PARTIAL_DATE_REGEX = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/;

export const parsePartialDate = (raw: unknown): string | undefined => {
  const value = toText(raw);

  if (!isDefined(value)) {
    return undefined;
  }

  const match = value.match(PARTIAL_DATE_REGEX);
  if (!isDefined(match)) {
    return undefined;
  }

  const [, year, month, day] = match;

  return `${year}-${month ?? '01'}-${day ?? '01'}`;
};
