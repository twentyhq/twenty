import { Avatar } from 'twenty-ui/data-display';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';

import { type EmailRecipientSuggestion } from '@/activities/emails/recipients/hooks/useEmailRecipientSuggestions';
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
      <MenuItemSelectAvatar
        onClick={() => onPick(suggestion)}
        text={suggestion.label}
        contextualText={suggestion.secondaryText}
        selected={false}
        focused={isSelectedItemId}
        avatar={
          <Avatar
            avatarUrl={getAbsoluteImageUrl(suggestion.avatarUrl)}
            placeholder={suggestion.label}
            placeholderColorSeed={suggestion.avatarColorSeed}
            size="md"
            type="rounded"
          />
        }
      />
    </SelectableListItem>
  );
};
