import { type IconComponent } from 'twenty-ui/display';

export type SidePanelFooterAction = {
  key: string;
  label: string;
  Icon?: IconComponent;
  isPrimaryCTA?: boolean;
  isPinned?: boolean;
  onClick: () => void;
  disabled?: boolean;
  hotkeys?: string[];
};
