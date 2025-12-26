import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useOpenCreateViewDropdown } from '@/views/hooks/useOpenCreateViewDropown';
import { useLingui } from '@lingui/react/macro';
import {
  IconCopy,
  IconLayout,
  IconListDetails,
  IconLock,
  useIcons,
} from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const ObjectOptionsDropdownDefaultView = () => {
  const { t } = useLingui();
  const { recordIndexId, onContentChange } = useObjectOptionsDropdown();

  const { currentView } = useGetCurrentViewOnly();

  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
    recordIndexId,
  );

  const visibleFieldsCount = visibleRecordFields.length;

  const selectableItemIdArray = [
    'Fields',
    'Copy link to view',
    'Create custom view',
  ];

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  const { openCreateViewDropdown } = useOpenCreateViewDropdown(recordIndexId);
  const { closeDropdown } = useCloseDropdown();

  const handleCreateCustomView = () => {
    closeDropdown(OBJECT_OPTIONS_DROPDOWN_ID);

    openCreateViewDropdown(currentView);
  };

  const { copyToClipboard } = useCopyToClipboard();

  const { getIcon } = useIcons();
  const MainIcon = getIcon(currentView?.icon);

  return (
    <DropdownContent>
      <DropdownMenuItemsContainer scrollable={false}>
        <MenuItem
          text={t`Default View`}
          LeftIcon={MainIcon}
          RightIcon={IconLock}
          disabled={true}
        />
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <SelectableList
        selectableListInstanceId={OBJECT_OPTIONS_DROPDOWN_ID}
        focusId={OBJECT_OPTIONS_DROPDOWN_ID}
        selectableItemIdArray={selectableItemIdArray}
      >
        <DropdownMenuItemsContainer scrollable={false}>
          <SelectableListItem
            itemId="Fields"
            onEnter={() => onContentChange('fields')}
          >
            <MenuItem
              focused={selectedItemId === 'Fields'}
              onClick={() => onContentChange('fields')}
              LeftIcon={IconListDetails}
              text={t`Fields`}
              contextualText={t`${visibleFieldsCount} shown`}
              contextualTextPosition="right"
              hasSubMenu
            />
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
            <MenuItem
              focused={selectedItemId === 'Copy link to view'}
              onClick={() => {
                const currentUrl = window.location.href;
                copyToClipboard(currentUrl, t`Link copied to clipboard`);
              }}
              LeftIcon={IconCopy}
              text={t`Copy link to view`}
            />
          </SelectableListItem>
          <SelectableListItem
            itemId="Create custom view"
            onEnter={handleCreateCustomView}
          >
            <MenuItem
              focused={selectedItemId === 'Create custom view'}
              onClick={handleCreateCustomView}
              LeftIcon={IconLayout}
              text={t`Create custom view`}
              contextualTextPosition="right"
            />
          </SelectableListItem>
        </DropdownMenuItemsContainer>
      </SelectableList>
    </DropdownContent>
  );
};
