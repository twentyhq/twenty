import { useLingui } from '@lingui/react/macro';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { IconRefresh } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { type useRecordSharing } from '@/object-record/record-sharing/hooks/useRecordSharing';
import { useSidePanelListItemFocus } from '@/side-panel/hooks/useSidePanelListItemFocus';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { ListItemIconContainer } from '@/ui/navigation/list-item/components/ListItemIconContainer';

type SidePanelShareRecordRetryItemProps = {
  itemId: string;
  refetch: ReturnType<typeof useRecordSharing>['refetch'];
};

export const SidePanelShareRecordRetryItem = ({
  itemId,
  refetch,
}: SidePanelShareRecordRetryItemProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { nativeItemRef, isSelectedItemId, handleFocus } =
    useSidePanelListItemFocus(itemId);
  const handleRetry = () => {
    void refetch().catch(() => {});
  };

  return (
    <SelectableListItem itemId={itemId} onEnter={handleRetry}>
      <ListItemButton
        ref={nativeItemRef}
        startIcon={
          <ListItemIconContainer>
            <IconRefresh
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
          </ListItemIconContainer>
        }
        focused={isSelectedItemId}
        onFocus={handleFocus}
        onClick={handleRetry}
      >
        {t`Try again`}
      </ListItemButton>
    </SelectableListItem>
  );
};
