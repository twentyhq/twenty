import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { InputHint } from '@/ui/input/components/InputHint';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Temporal } from 'temporal-polyfill';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import {
  isDefined,
  isSubDayRelativeDateFilterUnit,
  resolveRelativeDateFilterStringified,
  resolveRelativeDateTimeFilterStringified,
} from 'twenty-shared/utils';

type RelativeDateFilterRangeHintProps = {
  relativeDateFilterValue?: string | null;
  isDateTimeField?: boolean;
};

export const RelativeDateFilterRangeHint = ({
  relativeDateFilterValue,
  isDateTimeField,
}: RelativeDateFilterRangeHintProps) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const userLocale = currentWorkspaceMember?.locale ?? SOURCE_LOCALE;

  const formatPlainDate = (plainDate: Temporal.PlainDate) =>
    new Intl.DateTimeFormat(userLocale, { dateStyle: 'medium' }).format(
      new Date(plainDate.year, plainDate.month - 1, plainDate.day),
    );

  const formatPlainDateRange = (
    start: Temporal.PlainDate,
    endInclusive: Temporal.PlainDate,
  ) =>
    start.equals(endInclusive)
      ? formatPlainDate(start)
      : `${formatPlainDate(start)} – ${formatPlainDate(endInclusive)}`;

  const formatZonedDateTime = (zonedDateTime: Temporal.ZonedDateTime) =>
    new Intl.DateTimeFormat(userLocale, {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: zonedDateTime.timeZoneId,
    }).format(new Date(zonedDateTime.epochMilliseconds));

  let rangeLabel: string | null = null;

  if (isDateTimeField === true) {
    const resolved = resolveRelativeDateTimeFilterStringified(
      relativeDateFilterValue,
    );

    if (
      isDefined(resolved) &&
      isDefined(resolved.start) &&
      isDefined(resolved.end)
    ) {
      rangeLabel = isSubDayRelativeDateFilterUnit(resolved.unit)
        ? `${formatZonedDateTime(resolved.start)} → ${formatZonedDateTime(resolved.end)}`
        : formatPlainDateRange(
            resolved.start.toPlainDate(),
            resolved.end.subtract({ nanoseconds: 1 }).toPlainDate(),
          );
    }
  } else {
    const resolved = resolveRelativeDateFilterStringified(
      relativeDateFilterValue,
    );

    if (
      isDefined(resolved) &&
      isDefined(resolved.start) &&
      isDefined(resolved.end)
    ) {
      rangeLabel = formatPlainDateRange(
        Temporal.PlainDate.from(resolved.start),
        Temporal.PlainDate.from(resolved.end).subtract({ days: 1 }),
      );
    }
  }

  if (!isDefined(rangeLabel)) {
    return null;
  }

  return <InputHint>{rangeLabel}</InputHint>;
};
