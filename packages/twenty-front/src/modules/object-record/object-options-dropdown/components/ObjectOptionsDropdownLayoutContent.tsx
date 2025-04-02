import {
  IconBaselineDensitySmall,
  IconChevronLeft,
  IconLayoutList,
  IconLayoutNavbar,
  IconLayoutSidebarRight,
  IconTable,
  MenuItem,
  MenuItemSelect,
  MenuItemToggle,
  OverflowingTextWithTooltip,
} from 'twenty-ui';

import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { useSetViewTypeFromLayoutOptionsMenu } from '@/object-record/object-options-dropdown/hooks/useSetViewTypeFromLayoutOptionsMenu';
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
import { ViewType, viewTypeIconMapping } from '@/views/types/ViewType';
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

  const { setAndPersistViewType } = useSetViewTypeFromLayoutOptionsMenu();
  const { availableFieldsForKanban, navigateToSelectSettings } =
    useGetAvailableFieldsForKanban();

  const { closeDropdown } = useDropdown(dropdownId);

  const handleSelectKanbanViewType = async () => {
    if (isDefaultView) {
      return;
    }
    if (availableFieldsForKanban.length === 0) {
      navigateToSelectSettings();
      closeDropdown();
    }
    if (currentView?.type !== ViewType.Kanban) {
      await setAndPersistViewType(ViewType.Kanban);
    }
  };

  const isDefaultView = currentView?.key === 'INDEX';
  const nbsp = '\u00A0';

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
            onClick={async () => {
              if (currentView?.type !== ViewType.Table) {
                await setAndPersistViewType(ViewType.Table);
              }
            }}
          />
          <MenuItemSelect
            LeftIcon={viewTypeIconMapping(ViewType.Kanban)}
            text={t`Kanban`}
            disabled={isDefaultView}
            contextualText={
              isDefaultView ? (
                <>
                  {nbsp}·{nbsp}
                  <OverflowingTextWithTooltip
                    text={t`Not available for default view`}
                  />
                </>
              ) : availableFieldsForKanban.length === 0 ? (
                t`Create Select...`
              ) : undefined
            }
            selected={currentView?.type === ViewType.Kanban}
            onClick={handleSelectKanbanViewType}
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
