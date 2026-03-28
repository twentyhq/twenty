import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { RecordTableDataSourceDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableDataSourceDropdownContent';
import { RecordTableFieldsDropdownContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableFieldsDropdownContent';
import { WidgetSettingsFooter } from '@/side-panel/pages/page-layout/components/WidgetSettingsFooter';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconArrowsSort,
  IconDatabase,
  IconEye,
  IconFilter,
} from 'twenty-ui/display';
import { WidgetConfigurationType } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledSettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

export const SidePanelPageLayoutRecordTableSettings = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const { configuration } = widgetInEditMode;

  const isRecordTableConfiguration =
    configuration.configurationType === WidgetConfigurationType.RECORD_TABLE;

  const viewId =
    isRecordTableConfiguration &&
    'viewId' in configuration &&
    isDefined(configuration.viewId)
      ? (configuration.viewId as string)
      : undefined;

  const hasViewId = isDefined(viewId);

  const selectableItemIds = [
    'record-table-source',
    ...(hasViewId
      ? ['record-table-fields', 'record-table-filter', 'record-table-sort']
      : []),
  ];

  const handleFilterClick = () => {
    navigateToSidePanelSubPage(SidePanelSubPages.PageLayoutRecordTableFilter);
  };

  const handleSortClick = () => {
    navigateToSidePanelSubPage(SidePanelSubPages.PageLayoutRecordTableSort);
  };

  return (
    <StyledContainer>
      <WidgetComponentInstanceContext.Provider
        value={{ instanceId: widgetInEditMode.id }}
      >
        <StyledSettingsContainer>
          <SidePanelList
            commandGroups={[]}
            selectableItemIds={selectableItemIds}
          >
            <SidePanelGroup heading={t`Data`}>
              <SelectableListItem itemId="record-table-source">
                <CommandMenuItemDropdown
                  Icon={IconDatabase}
                  label={t`Source`}
                  id="record-table-source"
                  dropdownId="record-table-source"
                  dropdownComponents={
                    <DropdownContent>
                      <RecordTableDataSourceDropdownContent />
                    </DropdownContent>
                  }
                  dropdownPlacement="bottom-end"
                  hasSubMenu
                  contextualTextPosition="right"
                />
              </SelectableListItem>
              {hasViewId && (
                <>
                  <SelectableListItem itemId="record-table-fields">
                    <CommandMenuItemDropdown
                      Icon={IconEye}
                      label={t`Fields`}
                      id="record-table-fields"
                      dropdownId="record-table-fields"
                      dropdownComponents={
                        <RecordTableFieldsDropdownContent
                          viewId={viewId}
                          objectMetadataId={widgetInEditMode.objectMetadataId!}
                        />
                      }
                      dropdownPlacement="bottom-end"
                      hasSubMenu
                      contextualTextPosition="right"
                    />
                  </SelectableListItem>
                  <SelectableListItem
                    itemId="record-table-filter"
                    onEnter={handleFilterClick}
                  >
                    <CommandMenuItem
                      id="record-table-filter"
                      label={t`Filter`}
                      Icon={IconFilter}
                      hasSubMenu
                      onClick={handleFilterClick}
                      contextualTextPosition="right"
                    />
                  </SelectableListItem>
                  <SelectableListItem
                    itemId="record-table-sort"
                    onEnter={handleSortClick}
                  >
                    <CommandMenuItem
                      id="record-table-sort"
                      label={t`Sort`}
                      Icon={IconArrowsSort}
                      hasSubMenu
                      onClick={handleSortClick}
                      contextualTextPosition="right"
                    />
                  </SelectableListItem>
                </>
              )}
            </SidePanelGroup>
          </SidePanelList>
        </StyledSettingsContainer>
        <WidgetSettingsFooter pageLayoutId={pageLayoutId} />
      </WidgetComponentInstanceContext.Provider>
    </StyledContainer>
  );
};
