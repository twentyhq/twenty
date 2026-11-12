import { gettingStartedBookCallSlotsByDayState } from '@/getting-started/states/gettingStartedBookCallSlotsByDayState';
import { getBookCallAvailability } from '@/getting-started/utils/getBookCallAvailability';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { differenceInMinutes } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { IconClock, IconWorld } from 'twenty-ui/icon';
import { SKELETON_HEIGHT_SIZES, Skeleton } from 'twenty-ui/primitives/feedback';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledSummary = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledHost = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTwentyLogo = styled.img`
  border-radius: ${themeCssVariables.border.radius.sm};
  height: ${themeCssVariables.spacing[5]};
  width: ${themeCssVariables.spacing[5]};
`;

const StyledList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledListItem = styled.li`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledNextAvailable = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  margin-top: auto;
`;

export const GettingStartedBookCallSummary = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { timeZone, timeFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const gettingStartedBookCallSlotsByDay = useAtomStateValue(
    gettingStartedBookCallSlotsByDayState,
  );

  const { nextSlot } = getBookCallAvailability(
    gettingStartedBookCallSlotsByDay,
  );
  const callDurationMinutes = isDefined(nextSlot)
    ? differenceInMinutes(new Date(nextSlot.end), new Date(nextSlot.start))
    : null;

  const formatSlotStart = (dateFormat: string) =>
    isDefined(nextSlot)
      ? formatInTimeZone(new Date(nextSlot.start), timeZone, dateFormat, {
          locale: localeCatalog,
        })
      : '';

  return (
    <StyledSummary>
      <StyledHost>
        <StyledTwentyLogo src="/images/integrations/twenty-logo.svg" alt="" />
        <Text size="sm" weight="medium" color="secondary">
          {t`Twenty team`}
        </Text>
      </StyledHost>
      <StyledList>
        {isDefined(callDurationMinutes) && (
          <StyledListItem>
            <IconClock size={theme.icon.size.md} />
            {t`${callDurationMinutes} min`}
          </StyledListItem>
        )}
        <StyledListItem>
          <IconWorld size={theme.icon.size.md} />
          {timeZone.replaceAll('_', ' ')}
        </StyledListItem>
      </StyledList>
      <StyledNextAvailable>
        <Text size="xs" color="tertiary">
          {t`Next available`}
        </Text>
        {isDefined(gettingStartedBookCallSlotsByDay) ? (
          <Text size="sm" weight="medium" color="primary">
            {isDefined(nextSlot)
              ? `${formatSlotStart(doNotTranslate('EEE, MMM d'))} · ${formatSlotStart(timeFormat)}`
              : t`Pick a time that suits you`}
          </Text>
        ) : (
          <Skeleton height={SKELETON_HEIGHT_SIZES.s} />
        )}
      </StyledNextAvailable>
    </StyledSummary>
  );
};
