import { ObjectOptionsDropdownMenuViewName } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownMenuViewName';
import { OBJECT_OPTIONS_DROPDOWN_ID } from '@/object-record/object-options-dropdown/constants/ObjectOptionsDropdownId';
import { useObjectOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewKey } from '@/views/types/ViewKey';
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

interface ObjectOptionsDropdownCustomViewProps {
  onBackToDefault?: () => void;
}

export const ObjectOptionsDropdownCustomView = ({
  onBackToDefault,
}: ObjectOptionsDropdownCustomViewProps) => {
  const { t } = useLingui();
  const { recordIndexId, objectMetadataItem, onContentChange, closeDropdown } =
    useObjectOptionsDropdown();

  const { currentView } = useGetCurrentViewOnly();

  const customViewData = currentView
    ? {
        ...currentView,
        key: ViewKey.Custom,
        name: currentView.name || 'Custom View',
      }
    : null;

  const recordGroupFieldMetadata = useRecoilComponentValue(
    recordGroupFieldMetadataComponentState,
  );

  const calendarFieldMetadata = currentView?.calendarFieldMetadataId
    ? objectMetadataItem.fields.find(
        (field) => field.id === currentView.calendarFieldMetadataId,
      )
    : undefined;

  const isDefaultView = currentView?.key === ViewKey.Index;

  const { visibleBoardFields } = useObjectOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const { deleteViewFromCurrentState } = useDeleteViewFromCurrentState();
  const setViewPickerReferenceViewId = useSetRecoilComponentState(
    viewPickerReferenceViewIdComponentState,
  );

  const handleDelete = () => {
    if (!customViewData?.id) {
      return;
    }
    setViewPickerReferenceViewId(customViewData?.id);
    deleteViewFromCurrentState();
    closeDropdown();
    onBackToDefault?.();
  };

  const theme = useTheme();
  const { enqueueSuccessSnackBar } = useSnackBar();

  const selectableItemIdArray = [
    'Layout',
    ...(customViewData?.type !== ViewType.Calendar ? ['Fields'] : []),
    ...(customViewData?.type === ViewType.Calendar
      ? ['CalendarDateField']
      : []),
    ...(customViewData?.type !== ViewType.Calendar ? ['Group'] : []),
    'Copy link to view',
    'Delete view',
  ];

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    OBJECT_OPTIONS_DROPDOWN_ID,
  );

  if (!customViewData) {
    return null;
  }

  return (
    <DropdownContent>
      <ObjectOptionsDropdownMenuViewName currentView={customViewData} />
      <DropdownMenuSeparator />
      <SelectableList
        selectableListInstanceId={OBJECT_OPTIONS_DROPDOWN_ID}
        focusId={OBJECT_OPTIONS_DROPDOWN_ID}
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
                customViewData?.type ?? ViewType.Table,
              )}
              text={t`Layout`}
              contextualText={`${capitalize(customViewData?.type ?? '')}`}
              hasSubMenu
            />
          </SelectableListItem>
        </DropdownMenuItemsContainer>
        <DropdownMenuSeparator />
        <DropdownMenuItemsContainer scrollable={false}>
          {customViewData?.type !== ViewType.Calendar && (
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
          )}
          {customViewData?.type === ViewType.Calendar && (
            <div id="calendar-date-field-picker-menu-item">
              <SelectableListItem
                itemId="CalendarDateField"
                onEnter={() => onContentChange('calendarFields')}
              >
                <MenuItem
                  focused={selectedItemId === 'CalendarDateField'}
                  onClick={() => onContentChange('calendarFields')}
                  LeftIcon={IconLayoutList}
                  text={t`Date field`}
                  contextualText={
                    isDefaultView
                      ? t`Not available on Default View`
                      : calendarFieldMetadata?.label
                  }
                  hasSubMenu
                  disabled={isDefaultView}
                />
              </SelectableListItem>
            </div>
          )}
          {customViewData?.type !== ViewType.Calendar && (
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
          )}
          {isDefaultView && (
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
              enqueueSuccessSnackBar({
                message: t`Link copied to clipboard`,
                options: {
                  icon: <IconCopy size={theme.icon.size.md} />,
                  duration: 2000,
                },
              });
            }}
          >
            <MenuItem
              focused={selectedItemId === 'Copy link to view'}
              onClick={() => {
                const currentUrl = window.location.href;
                navigator.clipboard.writeText(currentUrl);
                enqueueSuccessSnackBar({
                  message: t`Link copied to clipboard`,
                  options: {
                    icon: <IconCopy size={theme.icon.size.md} />,
                    duration: 2000,
                  },
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
                disabled={isDefaultView}
              />
            </SelectableListItem>
          </div>
          {isDefaultView && (
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
