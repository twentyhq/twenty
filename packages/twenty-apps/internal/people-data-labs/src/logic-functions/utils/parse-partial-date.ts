import { toText } from 'src/logic-functions/utils/to-text';
import { isDefined } from 'src/utils/is-defined';

const PARTIAL_DATE_REGEX = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/;

export const parsePartialDate = (raw: unknown): string | undefined => {
  const dateText = toText(raw);

  if (!isDefined(dateText)) {
    return undefined;
  }

  const partialDateMatch = dateText.match(PARTIAL_DATE_REGEX);
  if (!isDefined(partialDateMatch)) {
    return undefined;
  }

  const [, year, month = '01', day = '01'] = partialDateMatch;
  const monthNumber = Number(month);
  const dayNumber = Number(day);

  const candidateDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
  const isRealCalendarDate =
    !Number.isNaN(candidateDate.getTime()) &&
    candidateDate.getUTCMonth() + 1 === monthNumber &&
    candidateDate.getUTCDate() === dayNumber;

  if (!isRealCalendarDate) {
    return undefined;
  }

  return `${year}-${month}-${day}`;
};
