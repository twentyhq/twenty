import { ListItem } from 'twenty-ui/primitives/navigation';
import { useLingui } from '@lingui/react/macro';
import { MenuItem } from 'twenty-ui/components';
import { IconMailCog, IconStatusChange, IconTrash } from 'twenty-ui/icon';

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
        <ListItem
          startIcon={<IconStatusChange />}
          description={reasonLabel}
          descriptionPlacement="end"
          hasSubmenu
          onClick={() => onContentChange('reason')}
        >{t`Reason`}</ListItem>
        <ListItem
          startIcon={<IconMailCog />}
          description={topicLabel}
          descriptionPlacement="end"
          hasSubmenu
          onClick={() => onContentChange('topic')}
        >{t`Topic`}</ListItem>
        {hasActiveFilters && (
          <>
            <DropdownMenuSeparator />
            <ListItem
              color="danger"
              startIcon={<IconTrash />}
              onClick={onClear}
            >{t`Clear filters`}</ListItem>
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
