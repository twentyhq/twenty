import { FieldDateDisplayFormat } from '@/object-record/record-field/ui/types/FieldMetadata';
import { differenceInMinutes } from 'date-fns';
import { useEffect } from 'react';

type RelativeDateUpdateEffectProps = {
  displayFormat?: FieldDateDisplayFormat;
  dateValue?: string | null;
  onTick: () => void;
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
    const now = new Date();
    const minutesDiff = Math.abs(differenceInMinutes(now, targetDate));

    let intervalMs: number;
    if (minutesDiff < 60) {
      intervalMs = 60000;
    } else if (minutesDiff < 1440) {
      intervalMs = 600000;
    } else {
      intervalMs = 3600000;
    }

    const interval = setInterval(() => {
      onTick();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [displayFormat, dateValue, onTick]);

  return <></>;
};
