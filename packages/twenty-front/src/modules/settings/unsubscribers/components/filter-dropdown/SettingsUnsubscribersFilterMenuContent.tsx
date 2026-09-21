import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
import { useLingui } from '@lingui/react/macro';
import { IconMailCog, IconStatusChange, IconTrash } from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';

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
          onClick={getDropdownMenuItemClickHandler(() =>
            onContentChange('reason'),
          )}
        >
          <OverflowingTextWithTooltip text={t`Reason`} />
        </ListItem>
        <ListItem
          startIcon={<IconMailCog />}
          description={topicLabel}
          descriptionPlacement="end"
          hasSubmenu
          onClick={getDropdownMenuItemClickHandler(() =>
            onContentChange('topic'),
          )}
        >
          <OverflowingTextWithTooltip text={t`Topic`} />
        </ListItem>
        {hasActiveFilters && (
          <>
            <DropdownMenuSeparator />
            <ListItem
              color="danger"
              startIcon={<IconTrash />}
              onClick={getDropdownMenuItemClickHandler(onClear)}
            >
              <OverflowingTextWithTooltip text={t`Clear filters`} />
            </ListItem>
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
