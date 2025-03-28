import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { ConfirmationModalProps } from '@/ui/layout/modal/components/ConfirmationModal';
import { MessageDescriptor } from '@lingui/core';
import { MouseEvent, ReactElement } from 'react';
import { MenuItemAccent } from 'twenty-ui/navigation';
import { IconComponent } from 'twenty-ui/display';

export enum ActionMenuEntryType {
  Standard = 'Standard',
  WorkflowRun = 'WorkflowRun',
  Fallback = 'Fallback',
  Navigation = 'Navigation',
}

export enum ActionMenuEntryScope {
  Global = 'Global',
  RecordSelection = 'RecordSelection',
  Object = 'Object',
}

export type ActionMenuEntry = {
  type: ActionMenuEntryType;
  scope: ActionMenuEntryScope;
  key: string;
  label: MessageDescriptor;
  shortLabel?: MessageDescriptor;
  position: number;
  Icon: IconComponent;
  isPinned?: boolean;
  accent?: MenuItemAccent;
  availableOn?: ActionViewType[];
  onClick?: (event?: MouseEvent<HTMLElement>) => void;
  ConfirmationModal?: ReactElement<ConfirmationModalProps>;
  hotKeys?: string[];
};
