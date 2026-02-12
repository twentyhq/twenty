import { type FieldDateMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';
import { TimeZoneAbbreviation } from '@/ui/input/components/internal/date/components/TimeZoneAbbreviation';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { UserContext } from '@/users/contexts/UserContext';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { Temporal } from 'temporal-polyfill';
import { dateLocaleStateV2 } from '~/localization/states/dateLocaleStateV2';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';
import { EllipsisDisplay } from './EllipsisDisplay';

const StyledTimeZoneSpacer = styled.span`
  min-width: ${({ theme }) => theme.spacing(1)};
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
  const dateLocale = useRecoilValueV2(dateLocaleStateV2);

  const formattedDate = formatDateTimeString({
    value,
    timeZone,
    dateFormat,
    timeFormat,
    dateFieldSettings,
    localeCatalog: dateLocale.localeCatalog,
  });

  return (
    <EllipsisDisplay>
      {formattedDate}
      <span></span>
      {isNonEmptyString(value) && (
        <>
          <StyledTimeZoneSpacer />
          <TimeZoneAbbreviation instant={Temporal.Instant.from(value)} />
        </>
      )}
    </EllipsisDisplay>
  );
};
