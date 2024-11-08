import { MouseEvent, ReactNode } from 'react';
import { IconComponent, MenuItemAccent } from 'twenty-ui';

export type ActionMenuEntry = {
  type: 'standard' | 'workflow-run';
  key: string;
  label: string;
  position: number;
  Icon: IconComponent;
  isPinned?: boolean;
  accent?: MenuItemAccent;
  onClick?: (event?: MouseEvent<HTMLElement>) => void;
  ConfirmationModal?: ReactNode;
};
