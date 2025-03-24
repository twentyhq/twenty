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
import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { ViewType } from '@/views/types/ViewType';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const ObjectOptionsDropdownLayoutContent = () => {
  const { t } = useLingui();
  const { currentView } = useGetCurrentViewOnly();

  const {
    recordIndexId,
    objectMetadataItem,
    viewType,
    resetContent,
    onContentChange,
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
      <DropdownMenuSeparator />
      <MenuItemSelect
        LeftIcon={IconTable}
        text={t`Table`}
        selected={viewType === ViewType.Table}
        onClick={() =>
          setAndPersistOpenRecordIn(
            ViewOpenRecordInType.SIDE_PANEL,
            currentView,
          )
        }
      />
      <MenuItemSelect
        LeftIcon={IconLayoutKanban}
        text={t`Kanban`}
        // contextualText={`${visibleBoardFields.length} shown`}
        selected={viewType === ViewType.Kanban}
        onClick={() =>
          setAndPersistOpenRecordIn(
            ViewOpenRecordInType.RECORD_PAGE,
            currentView,
          )
        }
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
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
        {viewType === ViewType.Kanban && (
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
    </>
  );
};
