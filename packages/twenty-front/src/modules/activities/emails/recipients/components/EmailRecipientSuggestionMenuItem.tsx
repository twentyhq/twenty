import { Avatar } from 'twenty-ui/primitives/data-display';
import { ListItem } from 'twenty-ui/primitives/navigation';

import { type EmailRecipientSuggestion } from '@/activities/emails/recipients/types/EmailRecipientSuggestion';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type EmailRecipientSuggestionMenuItemProps = {
  suggestion: EmailRecipientSuggestion;
  selectableListInstanceId: string;
  onPick: (suggestion: EmailRecipientSuggestion) => void;
};

export const EmailRecipientSuggestionMenuItem = ({
  suggestion,
  selectableListInstanceId,
  onPick,
}: EmailRecipientSuggestionMenuItemProps) => {
  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    suggestion.suggestionId,
    selectableListInstanceId,
  );

  return (
    <SelectableListItem itemId={suggestion.suggestionId}>
      <ListItem
        onClick={() => onPick(suggestion)}
        focused={isSelectedItemId}
        role="option"
        aria-selected={false}
        selected={false}
        indicator="check"
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
      </ListItem>
    </SelectableListItem>
  );
};
