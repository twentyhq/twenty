import { useLingui } from '@lingui/react/macro';
import { MenuItem } from 'twenty-ui/navigation';

import { EmailRecipientSuggestionMenuItem } from '@/activities/emails/recipients/components/EmailRecipientSuggestionMenuItem';
import { type EmailRecipientSuggestion } from '@/activities/emails/recipients/hooks/useEmailRecipientSuggestions';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';

type EmailRecipientSuggestionsDropdownContentProps = {
  suggestions: EmailRecipientSuggestion[];
  selectableListInstanceId: string;
  focusId: string;
  onPick: (suggestion: EmailRecipientSuggestion) => void;
};

export const EmailRecipientSuggestionsDropdownContent = ({
  suggestions,
  selectableListInstanceId,
  focusId,
  onPick,
}: EmailRecipientSuggestionsDropdownContentProps) => {
  const { t } = useLingui();

  return (
    <div onMouseDown={(event) => event.preventDefault()}>
      <DropdownContent widthInPixels={340}>
        <DropdownMenuItemsContainer hasMaxHeight>
          {suggestions.length === 0 ? (
            <MenuItem text={t`No results`} />
          ) : (
            <SelectableList
              selectableListInstanceId={selectableListInstanceId}
              focusId={focusId}
              selectableItemIdArray={suggestions.map(
                (suggestion) => suggestion.suggestionId,
              )}
            >
              {suggestions.map((suggestion) => (
                <EmailRecipientSuggestionMenuItem
                  key={suggestion.suggestionId}
                  suggestion={suggestion}
                  selectableListInstanceId={selectableListInstanceId}
                  onPick={onPick}
                />
              ))}
            </SelectableList>
          )}
        </DropdownMenuItemsContainer>
      </DropdownContent>
    </div>
  );
};
