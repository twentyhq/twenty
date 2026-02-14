import type {
  DefaultReactSuggestionItem,
  SuggestionMenuProps,
} from '@blocknote/react';
import { type IconComponent } from 'twenty-ui/display';

export type SuggestionItem = DefaultReactSuggestionItem & {
  aliases?: string[];
  Icon?: IconComponent;
};

export type CustomSlashMenuProps = SuggestionMenuProps<SuggestionItem>;

export type MentionItem = DefaultReactSuggestionItem & {
  recordId?: string;
  objectNameSingular?: string;
  objectMetadataId?: string;
  label?: string;
  imageUrl?: string;
  objectLabelSingular?: string;
};

export type CustomMentionMenuProps = SuggestionMenuProps<MentionItem>;
