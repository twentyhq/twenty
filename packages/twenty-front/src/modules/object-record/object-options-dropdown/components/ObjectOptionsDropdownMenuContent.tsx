import { Key } from 'ts-key-enum';

import { ObjectOptionsDropdownMenuViewName } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownMenuViewName';
import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewType, viewTypeIconMapping } from '@/views/types/ViewType';
import { useDeleteViewFromCurrentState } from '@/views/view-picker/hooks/useDeleteViewFromCurrentState';
import { viewPickerReferenceViewIdComponentState } from '@/views/view-picker/states/viewPickerReferenceViewIdComponentState';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { capitalize, isDefined } from 'twenty-shared/utils';
import {
  AppTooltip,
  IconCopy,
  IconLayoutList,
  IconListDetails,
  IconTrash,
} from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

export const ObjectOptionsDropdownMenuContent = () => {
  const { t } = useLingui();
  const { recordIndexId, objectMetadataItem, onContentChange, closeDropdown } =
    useOptionsDropdown();

  const { currentView } = useGetCurrentViewOnly();

  const recordGroupFieldMetadata = useRecoilComponentValueV2(
    recordGroupFieldMetadataComponentState,
  );

  const isGroupByEnabled =
    (isDefined(currentView?.viewGroups) && currentView.viewGroups.length > 0) ||
    currentView?.key !== 'INDEX';

  useScopedHotkeys(
    [Key.Escape],
    () => {
      closeDropdown();
    },
    TableOptionsHotkeyScope.Dropdown,
  );

  const { visibleBoardFields } = useObjectOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const { deleteViewFromCurrentState } = useDeleteViewFromCurrentState();
  const setViewPickerReferenceViewId = useSetRecoilComponentStateV2(
    viewPickerReferenceViewIdComponentState,
  );
  const handleDelete = () => {
    if (!currentView?.id) {
      return;
    }
    setViewPickerReferenceViewId(currentView?.id);
    deleteViewFromCurrentState();
    closeDropdown();
  };

  const theme = useTheme();
  const { enqueueSnackBar } = useSnackBar();

  const isDefaultView = currentView?.key === 'INDEX';

  const selectableItemIdArray = [
    'Layout',
    'Fields',
    ...(isDefaultView ? [] : ['Group']),
    'Copy link to view',
    ...(isDefaultView ? [] : ['Delete view']),
  ];

  const selectedItemId = useRecoilComponentValueV2(
    selectedItemIdComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  return (
    <DropdownContent>
      {currentView && (
        <ObjectOptionsDropdownMenuViewName currentView={currentView} />
      )}
      <DropdownMenuSeparator />
      <SelectableList
        selectableListInstanceId={OBJECT_OPTIONS_DROPDOWN_ID}
        hotkeyScope={TableOptionsHotkeyScope.Dropdown}
        selectableItemIdArray={selectableItemIdArray}
      >
        <DropdownMenuItemsContainer scrollable={false}>
          <SelectableListItem
            itemId="Layout"
            onEnter={() => onContentChange('layout')}
          >
            <MenuItem
              focused={selectedItemId === 'Layout'}
              onClick={() => onContentChange('layout')}
              LeftIcon={viewTypeIconMapping(
                currentView?.type ?? ViewType.Table,
              )}
              text={t`Layout`}
              contextualText={`${capitalize(currentView?.type ?? '')}`}
              hasSubMenu
            />
          </SelectableListItem>
        </DropdownMenuItemsContainer>
        <DropdownMenuSeparator />
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
              contextualText={`${visibleBoardFields.length} shown`}
              hasSubMenu
            />
          </SelectableListItem>
          <div id="group-by-menu-item">
            <SelectableListItem
              itemId="Group"
              onEnter={() =>
                isDefined(recordGroupFieldMetadata)
                  ? onContentChange('recordGroups')
                  : onContentChange('recordGroupFields')
              }
            >
              <MenuItem
                focused={selectedItemId === 'Group'}
                onClick={() =>
                  isDefined(recordGroupFieldMetadata)
                    ? onContentChange('recordGroups')
                    : onContentChange('recordGroupFields')
                }
                LeftIcon={IconLayoutList}
                text={t`Group`}
                contextualText={
                  isDefaultView
                    ? t`Not available on Default View`
                    : recordGroupFieldMetadata?.label
                }
                hasSubMenu
                disabled={isDefaultView}
              />
            </SelectableListItem>
          </div>
          {!isGroupByEnabled && (
            <AppTooltip
              anchorSelect={`#group-by-menu-item`}
              content={t`Not available on Default View`}
              noArrow
              place="bottom"
              width="100%"
            />
          )}
        </DropdownMenuItemsContainer>
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer scrollable={false}>
          <SelectableListItem
            itemId="Copy link to view"
            onEnter={() => {
              const currentUrl = window.location.href;
              navigator.clipboard.writeText(currentUrl);
              enqueueSnackBar('Link copied to clipboard', {
                variant: SnackBarVariant.Success,
                icon: <IconCopy size={theme.icon.size.md} />,
                duration: 2000,
              });
            }}
          >
            <MenuItem
              focused={selectedItemId === 'Copy link to view'}
              onClick={() => {
                const currentUrl = window.location.href;
                navigator.clipboard.writeText(currentUrl);
                enqueueSnackBar('Link copied to clipboard', {
                  variant: SnackBarVariant.Success,
                  icon: <IconCopy size={theme.icon.size.md} />,
                  duration: 2000,
                });
              }}
              LeftIcon={IconCopy}
              text={t`Copy link to view`}
            />
          </SelectableListItem>
          <div id="delete-view-menu-item">
            <SelectableListItem
              itemId="Delete view"
              onEnter={() => handleDelete()}
            >
              <MenuItem
                focused={selectedItemId === 'Delete view'}
                onClick={() => handleDelete()}
                LeftIcon={IconTrash}
                text={t`Delete view`}
                disabled={currentView?.key === 'INDEX'}
              />
            </SelectableListItem>
          </div>
          {currentView?.key === 'INDEX' && (
            <AppTooltip
              anchorSelect={`#delete-view-menu-item`}
              content={t`Not available on Default View`}
              noArrow
              place="bottom"
              width="100%"
            />
          )}
        </DropdownMenuItemsContainer>
      </SelectableList>
    </DropdownContent>
  );
};
