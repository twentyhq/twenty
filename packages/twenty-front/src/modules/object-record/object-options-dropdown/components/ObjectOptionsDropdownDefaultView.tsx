import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/surfaces';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { getDropdownMenuItemClickHandler } from '@/ui/layout/dropdown/utils/getDropdownMenuItemClickHandler';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useOpenCreateViewDropdown } from '@/views/hooks/useOpenCreateViewDropown';
import { useLingui } from '@lingui/react/macro';
import {
  IconCopy,
  IconLayout,
  IconListDetails,
  IconLock,
  useIcons,
} from 'twenty-ui/icon';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const ObjectOptionsDropdownDefaultView = () => {
  const { t } = useLingui();
  const { recordIndexId, onContentChange, dropdownId } =
    useObjectOptionsDropdown();

  const { currentView } = useGetCurrentViewOnly();

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
    recordIndexId,
  );

  const visibleFieldsCount = visibleRecordFields.length;

  const selectableItemIdArray = [
    'Fields',
    'Copy link to view',
    'Create custom view',
  ];

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const { openCreateViewDropdown } = useOpenCreateViewDropdown(recordIndexId);
  const { closeDropdown } = useCloseDropdown();

  const handleCreateCustomView = () => {
    closeDropdown(dropdownId);

    openCreateViewDropdown(currentView);
  };

  const { copyToClipboard } = useCopyToClipboard();

  const { getIcon } = useIcons();
  const MainIcon = getIcon(currentView?.icon);

  return (
    <DropdownContent>
      <DropdownMenuItemsContainer scrollable={false}>
        <ListItem
          startIcon={<SelectOptionIcon Icon={MainIcon} />}
          endIcon={<IconLock />}
          disabled={true}
        >
          <OverflowingTextWithTooltip text={t`Default View`} />
        </ListItem>
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <SelectableList
        selectableListInstanceId={dropdownId}
        focusId={dropdownId}
        selectableItemIdArray={selectableItemIdArray}
      >
        <DropdownMenuItemsContainer scrollable={false}>
          <SelectableListItem
            itemId="Fields"
            onEnter={() => onContentChange('fields')}
          >
            <ListItem
              focused={selectedItemId === 'Fields'}
              onClick={getDropdownMenuItemClickHandler(() =>
                onContentChange('fields'),
              )}
              startIcon={<IconListDetails />}
              description={t`${visibleFieldsCount} selected`}
              descriptionPlacement="end"
              hasSubmenu
            >
              <OverflowingTextWithTooltip text={t`Fields`} />
            </ListItem>
          </SelectableListItem>
        </DropdownMenuItemsContainer>
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer scrollable={false}>
          <SelectableListItem
            itemId="Copy link to view"
            onEnter={() => {
              const currentUrl = window.location.href;
              copyToClipboard(currentUrl, t`Link copied to clipboard`);
            }}
          >
            <ListItem
              focused={selectedItemId === 'Copy link to view'}
              onClick={getDropdownMenuItemClickHandler(() => {
                const currentUrl = window.location.href;
                copyToClipboard(currentUrl, t`Link copied to clipboard`);
              })}
              startIcon={<IconCopy />}
            >
              <OverflowingTextWithTooltip text={t`Copy link to view`} />
            </ListItem>
          </SelectableListItem>
          <SelectableListItem
            itemId="Create custom view"
            onEnter={handleCreateCustomView}
          >
            <ListItem
              focused={selectedItemId === 'Create custom view'}
              onClick={getDropdownMenuItemClickHandler(handleCreateCustomView)}
              startIcon={<IconLayout />}
              descriptionPlacement="end"
            >
              <OverflowingTextWithTooltip text={t`Create custom view`} />
            </ListItem>
          </SelectableListItem>
        </DropdownMenuItemsContainer>
      </SelectableList>
    </DropdownContent>
  );
};
