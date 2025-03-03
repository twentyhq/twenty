import { Key } from 'ts-key-enum';
import {
  AppTooltip,
  IconFileImport,
  IconLayout,
  IconLayoutList,
  IconList,
  IconTag,
  MenuItem,
  useIcons,
} from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { useOptionsDropdown } from '@/object-record/object-options-dropdown/hooks/useOptionsDropdown';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { TableOptionsHotkeyScope } from '@/object-record/record-table/types/TableOptionsHotkeyScope';
import { useOpenObjectRecordsSpreadsheetImportDialog } from '@/object-record/spreadsheet-import/hooks/useOpenObjectRecordsSpreadsheetImportDialog';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { ViewType } from '@/views/types/ViewType';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const ObjectOptionsDropdownMenuContent = () => {
  const { t } = useLingui();
  const {
    recordIndexId,
    objectMetadataItem,
    viewType,
    onContentChange,
    closeDropdown,
  } = useOptionsDropdown();

  const { getIcon } = useIcons();
  const { currentViewWithCombinedFiltersAndSorts: currentView } =
    useGetCurrentView();

  const CurrentViewIcon = currentView?.icon ? getIcon(currentView.icon) : null;

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

  const { openObjectRecordsSpreasheetImportDialog } =
    useOpenObjectRecordsSpreadsheetImportDialog(
      objectMetadataItem.nameSingular,
    );

  // TODO: Remove this once we have implemented Rich Text v2 and removed the old rich text
  const canImportOrExport =
    objectMetadataItem.nameSingular !== CoreObjectNameSingular.Note &&
    objectMetadataItem.nameSingular !== CoreObjectNameSingular.Task;

  const isCommandMenuV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IsCommandMenuV2Enabled,
  );

  return (
    <>
      <DropdownMenuHeader StartIcon={CurrentViewIcon ?? IconList}>
        {currentView?.name}
      </DropdownMenuHeader>

      {(isCommandMenuV2Enabled || viewType === ViewType.Kanban) && (
        <>
          <DropdownMenuItemsContainer scrollable={false}>
            <MenuItem
              onClick={() => onContentChange('viewSettings')}
              LeftIcon={IconLayout}
              text={t`View settings`}
              hasSubMenu
            />
          </DropdownMenuItemsContainer>
          <DropdownMenuSeparator />
        </>
      )}

      <DropdownMenuItemsContainer scrollable={false}>
        <MenuItem
          onClick={() => onContentChange('fields')}
          LeftIcon={IconTag}
          text={t`Fields`}
          contextualText={`${visibleBoardFields.length} shown`}
          hasSubMenu
        />

        <div id="group-by-menu-item">
          <MenuItem
            onClick={() =>
              isDefined(recordGroupFieldMetadata)
                ? onContentChange('recordGroups')
                : onContentChange('recordGroupFields')
            }
            LeftIcon={IconLayoutList}
            text={t`Group by`}
            contextualText={
              !isGroupByEnabled
                ? t`Not available on Default View`
                : recordGroupFieldMetadata?.label
            }
            hasSubMenu
            disabled={!isGroupByEnabled}
          />
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
      <DropdownMenuItemsContainer>
        {canImportOrExport && (
          <MenuItem
            onClick={() => {
              closeDropdown();
              openObjectRecordsSpreasheetImportDialog();
            }}
            LeftIcon={IconFileImport}
            text={t`Import`}
          />
        )}
      </DropdownMenuItemsContainer>
    </>
  );
};
