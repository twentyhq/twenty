import { type CalSlot } from '@/getting-started/types/CalSlot';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { formatInTimeZone } from 'date-fns-tz';
import { isDefined } from 'twenty-shared/utils';
import { SegmentedControl } from 'twenty-ui/components/input';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledDay = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledDayNumber = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledSlots = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 0;
  overflow-y: auto;
  padding-bottom: ${themeCssVariables.spacing[4]};
`;

type GettingStartedBookCallDaySlotsProps = {
  slots: CalSlot[];
  timeZone: string;
  timeFormat: TimeFormat;
  onTimeFormatChange: (timeFormat: TimeFormat) => void;
  onSelectSlot: (slot: CalSlot) => void;
};

export const GettingStartedBookCallDaySlots = ({
  slots,
  timeZone,
  timeFormat,
  onTimeFormatChange,
  onSelectSlot,
}: GettingStartedBookCallDaySlotsProps) => {
  const { t } = useLingui();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  const formatSlotStart = (slot: CalSlot, dateFormat: string) =>
    formatInTimeZone(new Date(slot.start), timeZone, dateFormat, {
      locale: localeCatalog,
    });

  const firstSlot = slots.at(0);

  return (
    <>
      <StyledHeader>
        {isDefined(firstSlot) && (
          <span>
            <StyledDay>{formatSlotStart(firstSlot, 'EEE')}</StyledDay>{' '}
            <StyledDayNumber>
              {formatSlotStart(firstSlot, 'do')}
            </StyledDayNumber>
          </span>
        )}
        <SegmentedControl
          size="sm"
          aria-label={t`Time format`}
          value={timeFormat}
          onValueChange={onTimeFormatChange}
          options={[
            { value: TimeFormat.HOUR_12, label: t`12h` },
            { value: TimeFormat.HOUR_24, label: t`24h` },
          ]}
        />
      </StyledHeader>
      <StyledSlots>
        {slots.map((slot) => (
          <Button
            key={slot.start}
            variant="outline"
            fullWidth
            onClick={() => onSelectSlot(slot)}
          >
            {formatSlotStart(slot, timeFormat)}
          </Button>
        ))}
      </StyledSlots>
    </>
  );
};
