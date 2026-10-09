import { Avatar } from 'twenty-ui/primitives/data-display';
import { Autocomplete } from 'twenty-ui/primitives/input';

import { type EmailRecipientSuggestion } from '@/activities/emails/recipients/types/EmailRecipientSuggestion';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type EmailRecipientSuggestionMenuItemProps = {
  suggestion: EmailRecipientSuggestion;
  onPick: (suggestion: EmailRecipientSuggestion) => void;
};

export const EmailRecipientSuggestionMenuItem = ({
  suggestion,
  onPick,
}: EmailRecipientSuggestionMenuItemProps) => (
  <Autocomplete.Item
    value={suggestion.suggestionId}
    onClick={() => onPick(suggestion)}
    description={suggestion.secondaryText}
    startIcon={
      <Avatar
        src={getAbsoluteImageUrl(suggestion.avatarUrl)}
        name={suggestion.label}
        colorSeed={suggestion.avatarColorSeed}
        size="md"
        shape="circle"
      />
    }
  >
    {suggestion.label}
  </Autocomplete.Item>
);
