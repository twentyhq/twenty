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
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { ViewType } from '@/views/types/ViewType';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const ObjectOptionsDropdownViewSettingsContent = () => {
  const { currentViewWithCombinedFiltersAndSorts } = useGetCurrentView();

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

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  return (
    <>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={resetContent}>
        View settings
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        {isCommandMenuV2Enabled && (
          <MenuItem
            onClick={() => onContentChange('viewSettingsOpenIn')}
            LeftIcon={
              recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL
                ? IconLayoutSidebarRight
                : IconLayoutNavbar
            }
            text="Open in"
            contextualText={
              recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL
                ? 'Side Panel'
                : 'Record Page'
            }
            hasSubMenu
          />
        )}
        {viewType === ViewType.Kanban && (
          <MenuItemToggle
            LeftIcon={IconBaselineDensitySmall}
            onToggleChange={() =>
              setAndPersistIsCompactModeActive(
                !isCompactModeActive,
                currentViewWithCombinedFiltersAndSorts,
              )
            }
            toggled={isCompactModeActive}
            text="Compact view"
            toggleSize="small"
          />
        )}
      </DropdownMenuItemsContainer>
    </>
  );
};
