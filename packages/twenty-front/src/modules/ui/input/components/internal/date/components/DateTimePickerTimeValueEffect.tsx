import { useEffect } from 'react';

type DateTimePickerTimeValueEffectProps = {
  value: string;
  setValue: (value: string) => void;
};

export const DateTimePickerTimeValueEffect = ({
  value,
  setValue,
}: DateTimePickerTimeValueEffectProps) => {
  useEffect(() => {
    setValue(value);
  }, [setValue, value]);

  return null;
};
