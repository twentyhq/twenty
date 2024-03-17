import { IconComponent, MenuItemAccent } from 'twenty-ui';

export type ContextMenuEntry = {
  label: string;
  Icon: IconComponent;
  accent?: MenuItemAccent;
  onClick: () => void;
};
