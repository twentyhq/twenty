import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { useRecordTableWidgetViewFieldItems } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetViewFieldItems';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { FieldWidgetFieldDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/FieldWidgetFieldDropdownContent';
import { FieldWidgetLayoutDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/FieldWidgetLayoutDropdownContent';
import { WidgetSettingsManageSection } from '@/side-panel/pages/page-layout/components/WidgetSettingsManageSection';
import { WidgetSettingsPlacementSection } from '@/side-panel/pages/page-layout/components/WidgetSettingsPlacementSection';
import { WIDGET_SETTINGS_SELECTABLE_ITEM_IDS } from '@/side-panel/pages/page-layout/constants/settings/WidgetSettingsSelectableItemIds';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { useWidgetSettingsPlacementSelectableItemIds } from '@/side-panel/pages/page-layout/hooks/useWidgetSettingsPlacementSelectableItemIds';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  IconLayoutSidebarRight,
  IconList,
  IconListDetails,
} from 'twenty-ui/display';
import {
  FieldDisplayMode,
  type FieldConfiguration,
} from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledSidePanelContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;

export const SidePanelRecordPageFieldSettings = () => {
  const { t } = useLingui();
  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  const { placementSelectableItemIds } =
    useWidgetSettingsPlacementSelectableItemIds(pageLayoutId);

  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const fieldConfiguration = widgetInEditMode?.configuration as
    | FieldConfiguration
    | undefined;

  const currentFieldMetadataId = fieldConfiguration?.fieldMetadataId;
  const currentDisplayMode = fieldConfiguration?.fieldDisplayMode;
  const currentViewId = isDefined(widgetInEditMode)
    ? getWidgetConfigurationViewId(widgetInEditMode.configuration)
    : null;

  const { fieldMetadataItem: currentFieldMetadataItem } =
    useFieldMetadataItemById(currentFieldMetadataId ?? '');

  const { recordTableWidgetViewFieldItems } =
    useRecordTableWidgetViewFieldItems({
      viewId: currentViewId ?? '',
      widgetId: widgetInEditMode?.id ?? '',
      pageLayoutId,
    });

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const isTableDisplayMode = currentDisplayMode === FieldDisplayMode.TABLE;

  const visibleFieldsCount = recordTableWidgetViewFieldItems.filter(
    (item) => item.viewField.isVisible,
  ).length;

  const handleNavigateToFields = () => {
    navigateToSidePanelSubPage(
      SidePanelSubPages.PageLayoutFieldRelationTableFields,
    );
  };

  const fieldLabel = currentFieldMetadataItem?.label ?? '';

  const displayModeLabels: Record<string, string> = {
    [FieldDisplayMode.FIELD]: t`Field`,
    [FieldDisplayMode.CARD]: t`Card`,
    [FieldDisplayMode.EDITOR]: t`Editor`,
    [FieldDisplayMode.TABLE]: t`Table`,
  };

  const layoutLabel = isDefined(currentDisplayMode)
    ? (displayModeLabels[currentDisplayMode] ?? '')
    : '';

  const selectableItemIds = [
    'field',
    'layout',
    ...(isTableDisplayMode ? ['fields'] : []),
    WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.VISIBILITY_RESTRICTION,
    WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.RESET_TO_DEFAULT,
    WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.REPLACE_WIDGET,
    WIDGET_SETTINGS_SELECTABLE_ITEM_IDS.DELETE_WIDGET,
    ...placementSelectableItemIds,
  ];

  return (
    <StyledContainer>
      <StyledSidePanelContainer>
        <SidePanelList selectableItemIds={selectableItemIds}>
          <SidePanelGroup heading={t`Data and display`}>
            <SelectableListItem itemId="field">
              <CommandMenuItemDropdown
                id="field"
                label={t`Field`}
                Icon={IconListDetails}
                dropdownId="field"
                dropdownComponents={
                  <DropdownContent>
                    <FieldWidgetFieldDropdownContent />
                  </DropdownContent>
                }
                dropdownPlacement="bottom-end"
                description={fieldLabel}
                contextualTextPosition="right"
              />
            </SelectableListItem>
            <SelectableListItem itemId="layout">
              <CommandMenuItemDropdown
                id="layout"
                label={t`Layout`}
                Icon={IconLayoutSidebarRight}
                dropdownId="layout"
                dropdownComponents={
                  <DropdownContent>
                    <FieldWidgetLayoutDropdownContent />
                  </DropdownContent>
                }
                dropdownPlacement="bottom-end"
                description={layoutLabel}
                contextualTextPosition="right"
              />
            </SelectableListItem>
            {isTableDisplayMode && (
              <SelectableListItem
                itemId="fields"
                onEnter={handleNavigateToFields}
              >
                <CommandMenuItem
                  id="fields"
                  label={t`Fields`}
                  Icon={IconList}
                  hasSubMenu
                  onClick={handleNavigateToFields}
                  description={t`${visibleFieldsCount} visible fields`}
                  contextualTextPosition="right"
                />
              </SelectableListItem>
            )}
          </SidePanelGroup>
          <WidgetSettingsManageSection pageLayoutId={pageLayoutId} />
          <WidgetSettingsPlacementSection pageLayoutId={pageLayoutId} />
        </SidePanelList>
      </StyledSidePanelContainer>
    </StyledContainer>
  );
};
