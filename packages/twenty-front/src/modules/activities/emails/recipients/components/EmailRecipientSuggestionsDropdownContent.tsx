import { useLingui } from '@lingui/react/macro';
import { Autocomplete } from 'twenty-ui/primitives/input';

import { EmailRecipientSuggestionMenuItem } from '@/activities/emails/recipients/components/EmailRecipientSuggestionMenuItem';
import { type EmailRecipientSuggestion } from '@/activities/emails/recipients/types/EmailRecipientSuggestion';

type EmailRecipientSuggestionsDropdownContentProps = {
  suggestions: EmailRecipientSuggestion[];
  onPick: (suggestion: EmailRecipientSuggestion) => void;
};

export const EmailRecipientSuggestionsDropdownContent = ({
  suggestions,
  onPick,
}: EmailRecipientSuggestionsDropdownContentProps) => {
  const { t } = useLingui();

  return (
    <Autocomplete.Popup align="start" sideOffset={4} width={340}>
      <Autocomplete.List>
        {suggestions.map((suggestion) => (
          <EmailRecipientSuggestionMenuItem
            key={suggestion.suggestionId}
            suggestion={suggestion}
            onPick={onPick}
          />
        ))}
      </Autocomplete.List>
      <Autocomplete.Empty>{t`No results`}</Autocomplete.Empty>
    </Autocomplete.Popup>
  );
};
