import React from 'react';
import { useTheme } from '@emotion/react';

import { RadioProps } from './Radio';

type RadioGroupProps = React.PropsWithChildren & {
  value?: string;
  onChange?: (value: string) => void;
};

export function RadioGroup({ value, onChange, children }: RadioGroupProps) {
  const theme = useTheme();

  function handleRadioChange(newValue: string) {
    onChange?.(newValue);
  }

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<RadioProps>(child)) {
          return React.cloneElement(child, {
            style: { marginBottom: theme.spacing(2) },
            checked: child.props.value === value,
            onChange: handleRadioChange,
          });
        }
        return child;
      })}
    </>
  );
}
