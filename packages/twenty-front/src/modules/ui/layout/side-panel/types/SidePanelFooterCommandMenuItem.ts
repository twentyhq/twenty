import { type IconComponent } from 'twenty-ui-deprecated/display';

export type SidePanelFooterCommandMenuItem = {
  id: string;
  label: string;
  Icon?: IconComponent;
  isPrimaryCTA?: boolean;
  isPinned?: boolean;
  onClick: () => void;
  disabled?: boolean;
  hotkeys?: string[];
};
