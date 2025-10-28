import { type FieldDateMetadataSettings } from '@/object-record/record-field/ui/types/FieldMetadata';
import { TimeZoneAbbreviation } from '@/ui/input/components/internal/date/components/TimeZoneAbbreviation';
import { UserContext } from '@/users/contexts/UserContext';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { dateLocaleState } from '~/localization/states/dateLocaleState';
import { formatDateTimeString } from '~/utils/string/formatDateTimeString';
import { EllipsisDisplay } from './EllipsisDisplay';

const StyledTimeZoneSpacer = styled.span`
  width: ${({ theme }) => theme.spacing(1)};
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
  const dateLocale = useRecoilValue(dateLocaleState);

  const formattedDate = formatDateTimeString({
    value,
    timeZone,
    dateFormat,
    timeFormat,
    dateFieldSettings,
    localeCatalog: dateLocale.localeCatalog,
  });

  console.log({
    formattedDate,
    date: value && new Date(value),
  });

  return (
    <EllipsisDisplay>
      {formattedDate}
      <span></span>
      {isNonEmptyString(value) && (
        <>
          <StyledTimeZoneSpacer />
          <TimeZoneAbbreviation date={new Date(value)} />
        </>
      )}
    </EllipsisDisplay>
  );
};
