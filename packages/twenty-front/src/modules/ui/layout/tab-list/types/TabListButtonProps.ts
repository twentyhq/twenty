import {
  type CSSProperties,
  type MouseEventHandler,
  type RefCallback,
} from 'react';
import { type LinkProps } from 'react-router-dom';
import { type IconComponent } from 'twenty-ui/icon';
import { type SingleTabProps } from './SingleTabProps';

export type TabListButtonProps = Pick<
  SingleTabProps,
  'id' | 'title' | 'disabled' | 'logo' | 'pill' | 'tooltipContent'
> & {
  active?: boolean;
  asTab?: boolean;
  className?: string;
  style?: CSSProperties;
  ref?: RefCallback<HTMLElement>;
  'data-dnd-sortable-handle'?: boolean;
  LeftIcon?: IconComponent;
  RightIcon?: IconComponent;
  to?: LinkProps['to'];
  state?: LinkProps['state'];
  replace?: LinkProps['replace'];
  disableTestId?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  onMouseEnter?: MouseEventHandler<HTMLElement>;
  onMouseLeave?: MouseEventHandler<HTMLElement>;
};
