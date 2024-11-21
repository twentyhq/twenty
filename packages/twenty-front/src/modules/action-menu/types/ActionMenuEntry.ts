import { MouseEvent, ReactNode } from 'react';
import { IconComponent, MenuItemAccent } from 'twenty-ui';

export enum ActionMenuEntryType {
  Standard = 'Standard',
  WorkflowRun = 'WorkflowRun',
}

export enum ActionMenuEntryScope {
  Global = 'Global',
  RecordSelection = 'RecordSelection',
}

export type ActionMenuEntry = {
  type: ActionMenuEntryType;
  scope: ActionMenuEntryScope;
  key: string;
  label: string;
  position: number;
  Icon: IconComponent;
  isPinned?: boolean;
  accent?: MenuItemAccent;
  onClick?: (event?: MouseEvent<HTMLElement>) => void;
  ConfirmationModal?: ReactNode;
};
