import { DropdownListItem } from '@/ui/layout/dropdown/components/DropdownListItem';
import { useLingui } from '@lingui/react/macro';
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
        <DropdownListItem
          startIcon={<IconStatusChange />}
          description={reasonLabel}
          descriptionPlacement="end"
          hasSubmenu
          onClick={() => onContentChange('reason')}
        >{t`Reason`}</DropdownListItem>
        <DropdownListItem
          startIcon={<IconMailCog />}
          description={topicLabel}
          descriptionPlacement="end"
          hasSubmenu
          onClick={() => onContentChange('topic')}
        >{t`Topic`}</DropdownListItem>
        {hasActiveFilters && (
          <>
            <DropdownMenuSeparator />
            <DropdownListItem
              color="danger"
              startIcon={<IconTrash />}
              onClick={onClear}
            >{t`Clear filters`}</DropdownListItem>
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
