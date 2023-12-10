import React from 'react';
import { useTheme } from '@emotion/react';

import { RadioProps } from './Radio';

type RadioGroupProps = React.PropsWithChildren & {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: string) => void;
};

export const RadioGroup = ({
  value,
  onChange,
  onValueChange,
  children,
}: RadioGroupProps) => {
  const theme = useTheme();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onValueChange?.(event.target.value);
  };

  return (
    <>
      {React.Children.map(children, (child) => {
        if (React.isValidElement<RadioProps>(child)) {
          return React.cloneElement(child, {
            style: { marginBottom: theme.spacing(2) },
            checked: child.props.value === value,
            onChange: handleChange,
          });
        }
        return child;
      })}
    </>
  );
};
