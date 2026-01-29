import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemToggle } from '@/command-menu/components/CommandMenuItemToggle';
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
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  IconChevronUp,
  IconCircleOff,
  IconCirclePlus,
  IconLayoutSidebarRight,
  IconSwitchHorizontal,
  IconTrash,
} from 'twenty-ui/display';

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

  const [showMoreFieldsButton, setShowMoreFieldsButton] = useState(true);

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

  const handleToggleMoreFieldsButton = () => {
    setShowMoreFieldsButton(!showMoreFieldsButton);
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

            <SelectableListItem
              itemId="display-more-fields-button"
              onEnter={handleToggleMoreFieldsButton}
            >
              <CommandMenuItemToggle
                id="display-more-fields-button"
                LeftIcon={IconCircleOff}
                text={t`Display "More fields" button`}
                toggled={showMoreFieldsButton}
                onToggleChange={handleToggleMoreFieldsButton}
              />
            </SelectableListItem>

            <SelectableListItem itemId="action-button">
              <CommandMenuItem
                id="action-button"
                label={t`Action Button`}
                Icon={IconCirclePlus}
                hasSubMenu
                description={t`None`}
                contextualTextPosition="right"
              />
            </SelectableListItem>
          </CommandGroup>

          <CommandGroup heading={t`More`}>
            <SelectableListItem itemId="move-down">
              <CommandMenuItem
                id="move-down"
                label={t`Move Down`}
                Icon={IconChevronDown}
              />
            </SelectableListItem>

            <SelectableListItem itemId="move-up">
              <CommandMenuItem
                id="move-up"
                label={t`Move Up`}
                Icon={IconChevronUp}
              />
            </SelectableListItem>

            <SelectableListItem itemId="move-to-tab">
              <CommandMenuItem
                id="move-to-tab"
                label={t`Move to another tab`}
                Icon={IconSwitchHorizontal}
              />
            </SelectableListItem>

            <SelectableListItem itemId="add-widget-above">
              <CommandMenuItem
                id="add-widget-above"
                label={t`Add widget above`}
                Icon={IconCirclePlus}
              />
            </SelectableListItem>

            <SelectableListItem itemId="add-widget-below">
              <CommandMenuItem
                id="add-widget-below"
                label={t`Add widget below`}
                Icon={IconCirclePlus}
              />
            </SelectableListItem>

            <SelectableListItem itemId="delete">
              <CommandMenuItem id="delete" label={t`Delete`} Icon={IconTrash} />
            </SelectableListItem>
          </CommandGroup>
        </CommandMenuList>
      </StyledCommandMenuContainer>
      <WidgetSettingsFooter pageLayoutId={pageLayoutId} />
    </StyledContainer>
  );
};
