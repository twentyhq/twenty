import { type ShortcutDefinition } from 'twenty-ui/primitives/typography';
import { type IconComponent } from 'twenty-ui/icon';

export type SidePanelFooterCommandMenuItem = {
  id: string;
  label: string;
  Icon?: IconComponent;
  isPrimaryCTA?: boolean;
  isPinned?: boolean;
  onClick: () => void;
  disabled?: boolean;
  shortcut?: ShortcutDefinition;
};
