import { CommandMenuItemDropdown } from '@/command-menu/components/CommandMenuItemDropdown';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useUpdatePageLayoutWidget } from '@/page-layout/hooks/useUpdatePageLayoutWidget';
import { getWidgetConfigurationViewId } from '@/page-layout/utils/getWidgetConfigurationViewId';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { ObjectSourceDropdownContent } from '@/side-panel/pages/page-layout/components/dropdown-content/ObjectSourceDropdownContent';
import { ViewWidgetViewDropdownContent } from '@/side-panel/pages/page-layout/components/view-widget-settings/ViewWidgetViewDropdownContent';
import { WidgetSettingsFooter } from '@/side-panel/pages/page-layout/components/WidgetSettingsFooter';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useViewById } from '@/views/hooks/useViewById';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconBox, IconTable } from 'twenty-ui/icon';

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

const SOURCE_ITEM_ID = 'view-widget-source';
const VIEW_ITEM_ID = 'view-widget-view';

export const SidePanelDashboardViewWidgetSettings = () => {
  const { t } = useLingui();

  const { pageLayoutId } = usePageLayoutSidePanelTarget();
  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);
  const { updatePageLayoutWidget } = useUpdatePageLayoutWidget(pageLayoutId);
  const { closeDropdown } = useCloseDropdown();
  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataId = widgetInEditMode?.objectMetadataId;

  const viewId = isDefined(widgetInEditMode)
    ? getWidgetConfigurationViewId(widgetInEditMode.configuration)
    : null;

  const { view } = useViewById(viewId);

  const objectMetadataItem = objectMetadataItems.find(
    (objectMetadataItemToFind) =>
      objectMetadataItemToFind.id === objectMetadataId,
  );

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const handleSelectSource = (newObjectMetadataItemId: string) => {
    if (newObjectMetadataItemId === objectMetadataId) {
      closeDropdown(SOURCE_ITEM_ID);
      return;
    }

    updateCurrentWidgetConfig({
      objectMetadataId: newObjectMetadataItemId,
      configToUpdate: { viewId: undefined },
    });

    const selectedObjectMetadataItem = objectMetadataItems.find(
      (item) => item.id === newObjectMetadataItemId,
    );

    if (isDefined(selectedObjectMetadataItem)) {
      updatePageLayoutWidget(widgetInEditMode.id, {
        title: selectedObjectMetadataItem.labelPlural,
      });
    }

    closeDropdown(SOURCE_ITEM_ID);
  };

  const getViewDescription = () => {
    if (isDefined(view)) {
      return view.name;
    }

    return isDefined(viewId) ? t`Deleted view` : t`None`;
  };

  return (
    <StyledContainer>
      <WidgetComponentInstanceContext.Provider
        value={{ instanceId: widgetInEditMode.id }}
      >
        <StyledSettingsContainer>
          <SidePanelList selectableItemIds={[SOURCE_ITEM_ID, VIEW_ITEM_ID]}>
            <SidePanelGroup heading={t`Settings`}>
              <SelectableListItem itemId={SOURCE_ITEM_ID}>
                <CommandMenuItemDropdown
                  Icon={IconBox}
                  label={t`Source`}
                  id={SOURCE_ITEM_ID}
                  dropdownId={SOURCE_ITEM_ID}
                  dropdownComponents={
                    <LegacyDropdownContent>
                      <ObjectSourceDropdownContent
                        selectedObjectMetadataItemId={objectMetadataId}
                        onSelect={handleSelectSource}
                      />
                    </LegacyDropdownContent>
                  }
                  dropdownPlacement="bottom-end"
                  hasSubMenu
                  description={objectMetadataItem?.labelPlural ?? t`None`}
                  contextualTextPosition="right"
                />
              </SelectableListItem>
              <SelectableListItem itemId={VIEW_ITEM_ID}>
                <CommandMenuItemDropdown
                  Icon={IconTable}
                  label={t`View`}
                  id={VIEW_ITEM_ID}
                  dropdownId={VIEW_ITEM_ID}
                  dropdownComponents={
                    <LegacyDropdownContent>
                      <ViewWidgetViewDropdownContent />
                    </LegacyDropdownContent>
                  }
                  dropdownPlacement="bottom-end"
                  hasSubMenu
                  disabled={!isDefined(objectMetadataId)}
                  description={getViewDescription()}
                  contextualTextPosition="right"
                />
              </SelectableListItem>
            </SidePanelGroup>
          </SidePanelList>
        </StyledSettingsContainer>
        <WidgetSettingsFooter pageLayoutId={pageLayoutId} />
      </WidgetComponentInstanceContext.Provider>
    </StyledContainer>
  );
};
