import {
  type FunctionComponent,
  type MouseEvent,
  type ReactElement,
} from 'react';
import { type LightIconButtonProps } from 'twenty-ui/components';
import { type IconComponent } from 'twenty-ui/icon';

export type MenuItemIconButton = {
  Wrapper?: FunctionComponent<{ iconButton: ReactElement }>;
  Icon: IconComponent;
  accent?: LightIconButtonProps['accent'];
  onClick?: (event: MouseEvent<any>) => void;
};
