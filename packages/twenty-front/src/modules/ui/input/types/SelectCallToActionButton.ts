import { type MouseEvent } from 'react';
import { type IconComponent } from 'twenty-ui/icon';
export type SelectCallToActionButton = {
  text: string;
  onClick: (event: MouseEvent<HTMLElement>) => void;
  Icon?: IconComponent;
};
