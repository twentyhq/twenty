import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemToggle } from '@/command-menu/components/CommandMenuItemToggle';
import { useFieldsWidgetGroups } from '@/page-layout/widgets/fields/hooks/useFieldsWidgetGroups';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { NewFieldDefaultVisibilityToggle } from '@/side-panel/pages/page-layout/components/NewFieldDefaultVisibilityToggle';
import { WidgetSettingsFooter } from '@/side-panel/pages/page-layout/components/WidgetSettingsFooter';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useUpdateCurrentWidgetConfig } from '@/side-panel/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/side-panel/pages/page-layout/hooks/useWidgetInEditMode';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronDown, IconLayoutSidebarRight } from 'twenty-ui/display';
import { type FieldsConfiguration } from '~/generated-metadata/graphql';

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

export const SidePanelPageLayoutFieldsSettings = () => {
  const { t } = useLingui();
  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();
  const { pageLayoutId, objectNameSingular } =
    usePageLayoutIdFromContextStore();

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const fieldsConfiguration = widgetInEditMode?.configuration as
    | FieldsConfiguration
    | undefined;

  const { groups } = useFieldsWidgetGroups({
    viewId: fieldsConfiguration?.viewId ?? null,
    objectNameSingular,
  });

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const totalFieldsCount = groups.reduce(
    (count, group) => count + group.fields.length,
    0,
  );

  const handleNavigateToLayout = () => {
    navigateToSidePanelSubPage(SidePanelSubPages.PageLayoutFieldsLayout);
  };

  const isShouldAllowUserToSeeHiddenFieldsToggled =
    fieldsConfiguration?.shouldAllowUserToSeeHiddenFields === true;

  const handleToggleShouldAllowUserToSeeHiddenFields = () => {
    updateCurrentWidgetConfig({
      configToUpdate: {
        shouldAllowUserToSeeHiddenFields:
          !isShouldAllowUserToSeeHiddenFieldsToggled,
      },
    });
  };

  const selectableItemIds = [
    'layout',
    'new-field-default-visibility',
    'display-more-fields-button',
    'action-button',
    'move-down',
    'move-up',
    'move-to-tab',
    'add-widget-above',
    'add-widget-below',
    'delete',
  ];

  return (
    <StyledContainer>
      <StyledSidePanelContainer>
        <SidePanelList commandGroups={[]} selectableItemIds={selectableItemIds}>
          <SidePanelGroup heading={t`Data and display`}>
            <SelectableListItem
              itemId="layout"
              onEnter={handleNavigateToLayout}
            >
              <CommandMenuItem
                id="layout"
                label={t`Layout`}
                Icon={IconLayoutSidebarRight}
                hasSubMenu
                onClick={handleNavigateToLayout}
                description={t`${totalFieldsCount} fields`}
                contextualTextPosition="right"
              />
            </SelectableListItem>
            <SelectableListItem
              itemId="display-more-fields-button"
              onEnter={handleToggleShouldAllowUserToSeeHiddenFields}
            >
              <CommandMenuItemToggle
                LeftIcon={IconChevronDown}
                text={t`Display "More fields" button`}
                id="display-more-fields-button"
                toggled={isShouldAllowUserToSeeHiddenFieldsToggled}
                onToggleChange={handleToggleShouldAllowUserToSeeHiddenFields}
              />
            </SelectableListItem>
            <NewFieldDefaultVisibilityToggle
              pageLayoutId={pageLayoutId}
              widgetId={widgetInEditMode.id}
            />
          </SidePanelGroup>
        </SidePanelList>
      </StyledSidePanelContainer>
      <WidgetSettingsFooter pageLayoutId={pageLayoutId} />
    </StyledContainer>
  );
};
