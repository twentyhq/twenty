import { type FieldDateMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';
import { TimeZoneAbbreviation } from '@/ui/input/components/internal/date/components/TimeZoneAbbreviation';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { UserContext } from '@/users/contexts/UserContext';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { parseStringToInstantOrNull } from '~/utils/dates/parseStringToInstantOrNull';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';
import { EllipsisDisplay } from './EllipsisDisplay';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledTimeZoneSpacer = styled.span`
  min-width: ${themeCssVariables.spacing[1]};
`;

type DateTimeDisplayProps = {
  value: string | null | undefined;
  dateFieldSettings?: FieldDateMetadataSettings;
};

export const DateTimeDisplay = ({
  value,
  dateFieldSettings,
}: DateTimeDisplayProps) => {
  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const dateLocale = useAtomStateValue(dateLocaleState);

  const formattedDate = formatDateTimeString({
    value,
    timeZone,
    dateFormat,
    timeFormat,
    dateFieldSettings,
    localeCatalog: dateLocale.localeCatalog,
  });

  // A date-time field can hold a legacy date-only value (e.g. "2026-05-07") from
  // imports or API writes. Temporal.Instant.from is strict and throws on those,
  // which would crash the whole field/widget. Parse leniently so the timezone
  // hint degrades instead of crashing.
  const instant = isNonEmptyString(value)
    ? parseStringToInstantOrNull(value)
    : null;

  return (
    <EllipsisDisplay>
      {formattedDate}
      <span></span>
      {isDefined(instant) && (
        <>
          <StyledTimeZoneSpacer />
          <TimeZoneAbbreviation instant={instant} />
        </>
      )}
    </EllipsisDisplay>
  );
};
