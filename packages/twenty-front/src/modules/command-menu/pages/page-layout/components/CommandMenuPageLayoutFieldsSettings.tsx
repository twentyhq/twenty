import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { WidgetSettingsFooter } from '@/command-menu/pages/page-layout/components/WidgetSettingsFooter';
import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useTemporaryFieldsConfiguration } from '@/page-layout/hooks/useTemporaryFieldsConfiguration';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconLayoutSidebarRight } from 'twenty-ui/display';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledCommandMenuContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

export const CommandMenuPageLayoutFieldsSettings = () => {
  const { t } = useLingui();
  const { navigatePageLayoutCommandMenu } = useNavigatePageLayoutCommandMenu();
  const { pageLayoutId, objectNameSingular } =
    usePageLayoutIdForRecordPageLayoutFromContextStoreTargetedRecord();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);
  const fieldsConfiguration =
    useTemporaryFieldsConfiguration(objectNameSingular);

  if (!isDefined(widgetInEditMode)) {
    return null;
  }

  const totalFieldsCount = fieldsConfiguration.sections.reduce(
    (count, section) => count + section.fields.length,
    0,
  );

  const handleNavigateToLayout = () => {
    navigatePageLayoutCommandMenu({
      commandMenuPage: CommandMenuPages.PageLayoutFieldsLayout,
    });
  };

  const selectableItemIds = [
    'layout',
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
      <StyledCommandMenuContainer>
        <CommandMenuList
          commandGroups={[]}
          selectableItemIds={selectableItemIds}
        >
          <CommandGroup heading={t`Customize`}>
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
          </CommandGroup>
        </CommandMenuList>
      </StyledCommandMenuContainer>
      <WidgetSettingsFooter pageLayoutId={pageLayoutId} />
    </StyledContainer>
  );
};
