import { FieldDateDisplayFormat } from '@/object-record/record-field/ui/types/FieldMetadata';
import { differenceInMinutes } from 'date-fns';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RelativeDateUpdateEffectProps = {
  displayFormat?: FieldDateDisplayFormat;
  dateValue?: string | null;
  onTick: () => void;
};

const getIntervalMs = (targetDate: Date, now: Date): number => {
  const minutesDiff = Math.abs(differenceInMinutes(now, targetDate));

  if (minutesDiff < 60) {
    return 1000;
  } else if (minutesDiff < 1440) {
    return 60000;
  } else {
    return 3600000;
  }
};

export const RelativeDateUpdateEffect = ({
  displayFormat,
  dateValue,
  onTick,
}: RelativeDateUpdateEffectProps) => {
  useEffect(() => {
    if (displayFormat !== FieldDateDisplayFormat.RELATIVE || !dateValue) {
      return;
    }

    const targetDate = new Date(dateValue);
    let timeoutId: NodeJS.Timeout | null = null;

    const scheduleNextTick = () => {
      const now = new Date();
      const intervalMs = getIntervalMs(targetDate, now);

      timeoutId = setTimeout(() => {
        onTick();
        scheduleNextTick();
      }, intervalMs);
    };

    scheduleNextTick();

    return () => {
      if (isDefined(timeoutId)) {
        clearTimeout(timeoutId);
      }
    };
  }, [displayFormat, dateValue, onTick]);

  return <></>;
};
