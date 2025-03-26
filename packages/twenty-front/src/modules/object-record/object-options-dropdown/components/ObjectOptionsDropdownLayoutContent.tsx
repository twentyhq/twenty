import {
  IconBaselineDensitySmall,
  IconChevronLeft,
  IconLayoutKanban,
  IconLayoutList,
  IconLayoutNavbar,
  IconLayoutSidebarRight,
  IconTable,
  MenuItem,
  MenuItemSelect,
  MenuItemToggle,
} from 'twenty-ui';

import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { useObjectOptionsForLayout } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForLayout';
import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { ViewType } from '@/views/types/ViewType';
import { useGetAvailableFieldsForKanban } from '@/views/view-picker/hooks/useGetAvailableFieldsForKanban';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const ObjectOptionsDropdownLayoutContent = () => {
  const { t } = useLingui();
  const { currentView } = useGetCurrentViewOnly();

  const {
    recordIndexId,
    objectMetadataItem,
    resetContent,
    onContentChange,
    dropdownId,
  } = useOptionsDropdown();

  const { isCompactModeActive, setAndPersistIsCompactModeActive } =
    useObjectOptionsForBoard({
      objectNameSingular: objectMetadataItem.nameSingular,
      recordBoardId: recordIndexId,
      viewBarId: recordIndexId,
    });

  const recordIndexOpenRecordIn = useRecoilValue(recordIndexOpenRecordInState);

  const recordGroupFieldMetadata = useRecoilComponentValueV2(
    recordGroupFieldMetadataComponentState,
  );

  const { useSetAndPersistViewType } = useObjectOptionsForLayout();
  const { availableFieldsForKanban, navigateToSelectSettings } =
    useGetAvailableFieldsForKanban();

  const { closeDropdown } = useDropdown(dropdownId);

  const handleClickOnKanban = () => {
    if (availableFieldsForKanban.length === 0) {
      navigateToSelectSettings();
      closeDropdown();
    }
    if (currentView?.type !== ViewType.Kanban) {
      useSetAndPersistViewType(ViewType.Kanban);
    }
  };

  return (
    <>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={resetContent}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Layout`}
      </DropdownMenuHeader>
      {!!currentView && (
        <DropdownMenuItemsContainer>
          <MenuItemSelect
            LeftIcon={IconTable}
            text={t`Table`}
            selected={currentView?.type === ViewType.Table}
            onClick={() => {
              currentView?.type !== ViewType.Table &&
                useSetAndPersistViewType(ViewType.Table);
            }}
          />
          <MenuItemSelect
            LeftIcon={IconLayoutKanban}
            text={t`Kanban`}
            contextualText={
              availableFieldsForKanban.length === 0
                ? t`Create Select...`
                : undefined
            }
            selected={currentView?.type === ViewType.Kanban}
            onClick={handleClickOnKanban}
          />
          <DropdownMenuSeparator />
          <MenuItem
            onClick={() => onContentChange('layoutOpenIn')}
            LeftIcon={
              recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL
                ? IconLayoutSidebarRight
                : IconLayoutNavbar
            }
            text={t`Open in`}
            contextualText={
              recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL
                ? t`Side Panel`
                : t`Record Page`
            }
            hasSubMenu
          />
          {currentView?.type === ViewType.Kanban && (
            <>
              <MenuItem
                onClick={() =>
                  isDefined(recordGroupFieldMetadata)
                    ? onContentChange('recordGroups')
                    : onContentChange('recordGroupFields')
                }
                LeftIcon={IconLayoutList}
                text={t`Group`}
                contextualText={recordGroupFieldMetadata?.label}
                hasSubMenu
              />

              <MenuItemToggle
                LeftIcon={IconBaselineDensitySmall}
                onToggleChange={() =>
                  setAndPersistIsCompactModeActive(
                    !isCompactModeActive,
                    currentView,
                  )
                }
                toggled={isCompactModeActive}
                text={t`Compact view`}
                toggleSize="small"
              />
            </>
          )}
        </DropdownMenuItemsContainer>
      )}
    </>
  );
};
