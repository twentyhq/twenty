import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { type Ref } from 'react';
import { useIMask } from 'react-imask';
import { type Temporal } from 'temporal-polyfill';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { IconClock } from 'twenty-ui/icon';
import { Field, Input, InputGroup } from 'twenty-ui/primitives/input';
import { Separator } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { DateTimePickerInput } from '@/ui/input/components/internal/date/components/DateTimePickerInput';
import { DateTimePickerTimeValueEffect } from '@/ui/input/components/internal/date/components/DateTimePickerTimeValueEffect';
import { useTimeInput } from '@/ui/input/components/internal/date/hooks/useTimeInput';
import { getTimeBlocks } from '@/ui/input/components/internal/date/utils/getTimeBlocks';
import { getTimeMask } from '@/ui/input/components/internal/date/utils/getTimeMask';

const StyledTimeRow = styled.div`
  padding: ${themeCssVariables.spacing[2]};
`;

type DateTimePickerHeaderProps = {
  date: Temporal.ZonedDateTime;
  onChange?: (date: Temporal.ZonedDateTime | null) => void;
  hideInput?: boolean;
  timeZone: string;
};

export const DateTimePickerHeader = ({
  date,
  onChange,
  hideInput = false,
  timeZone,
}: DateTimePickerHeaderProps) => {
  const { timeFormat } = useDateTimeFormat();
  const { formatTime, parseTime, isHour12 } = useTimeInput(timeFormat);
  const formattedTime = formatTime(date.hour, date.minute);
  const { ref, setValue } = useIMask(
    {
      mask: getTimeMask(timeFormat),
      blocks: getTimeBlocks(timeFormat),
      lazy: false,
      autofix: true,
    },
    {
      defaultValue: formattedTime,
      onComplete: (value) => {
        const parsedTime = parseTime(value);

        if (!isDefined(parsedTime)) {
          return;
        }

        const isUnchangedTime =
          parsedTime.hour === date.hour && parsedTime.minute === date.minute;

        if (isUnchangedTime) {
          return;
        }

        onChange?.(
          date.with({ hour: parsedTime.hour, minute: parsedTime.minute }),
        );
      },
    },
  );

  return (
    <>
      <DateTimePickerTimeValueEffect
        value={formattedTime}
        setValue={setValue}
      />
      {!hideInput && (
        <>
          <DateTimePickerInput
            date={date}
            onChange={onChange}
            timeZone={timeZone}
          />
          <Separator />
        </>
      )}
      <StyledTimeRow>
        <Field.Root>
          <InputGroup startElement={<IconClock />}>
            <Input
              type="text"
              ref={ref as Ref<HTMLInputElement>}
              placeholder={doNotTranslate(isHour12 ? 'HH:mm AA' : 'HH:mm')}
              aria-label={t`Time`}
            />
          </InputGroup>
        </Field.Root>
      </StyledTimeRow>
    </>
  );
};
