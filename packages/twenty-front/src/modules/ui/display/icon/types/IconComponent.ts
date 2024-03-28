import { FunctionComponent } from 'react';

export type IconComponentProps = {
  className?: string;
  color?: string;
  size?: number;
  stroke?: number;
};

export type IconComponent = FunctionComponent<IconComponentProps>;
