import { useLingui } from '@lingui/react/macro';
import { IconMailCog, IconStatusChange, IconTrash } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';

import { type SettingsUnsubscribersFilterContentId } from '@/settings/unsubscribers/components/filter-dropdown/types/SettingsUnsubscribersFilterContentId';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';

type SettingsUnsubscribersFilterMenuContentProps = {
  reasonLabel: string;
  topicLabel: string;
  hasActiveFilters: boolean;
  onContentChange: (contentId: SettingsUnsubscribersFilterContentId) => void;
  onClear: () => void;
};

export const SettingsUnsubscribersFilterMenuContent = ({
  reasonLabel,
  topicLabel,
  hasActiveFilters,
  onContentChange,
  onClear,
}: SettingsUnsubscribersFilterMenuContentProps) => {
  const { t } = useLingui();

  return (
    <DropdownContent>
      <DropdownMenuItemsContainer>
        <MenuItem
          LeftIcon={IconStatusChange}
          text={t`Reason`}
          contextualText={reasonLabel}
          contextualTextPosition="right"
          hasSubMenu
          onClick={() => onContentChange('reason')}
        />
        <MenuItem
          LeftIcon={IconMailCog}
          text={t`Topic`}
          contextualText={topicLabel}
          contextualTextPosition="right"
          hasSubMenu
          onClick={() => onContentChange('topic')}
        />
        {hasActiveFilters && (
          <>
            <DropdownMenuSeparator />
            <MenuItem
              accent="danger"
              LeftIcon={IconTrash}
              text={t`Clear filters`}
              onClick={onClear}
            />
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
