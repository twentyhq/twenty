import type { SuggestionMenuProps } from '@blocknote/react';
import { type IconComponent } from 'twenty-ui/display';

export type SuggestionItem = {
  title: string;
  onItemClick: () => void;
  aliases?: string[];
  Icon?: IconComponent;
};

export type CustomSlashMenuProps = SuggestionMenuProps<SuggestionItem>;
