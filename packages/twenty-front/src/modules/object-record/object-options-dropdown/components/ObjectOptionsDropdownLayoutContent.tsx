import {
  IconBaselineDensitySmall,
  IconChevronLeft,
  IconLayoutNavbar,
  IconLayoutSidebarRight,
  MenuItem,
  MenuItemToggle,
} from 'twenty-ui';

import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { ViewType } from '@/views/types/ViewType';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';

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
        )}
      </DropdownMenuItemsContainer>
    </>
  );
};
