import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconColumnInsertRight,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';

import { CommandMenuAskAIInfo } from '@/command-menu/components/CommandMenuAskAIInfo';
import { CommandMenuFolderInfo } from '@/command-menu/components/CommandMenuFolderInfo';
import { CommandMenuLinkInfo } from '@/command-menu/components/CommandMenuLinkInfo';
import { CommandMenuMultipleRecordsInfo } from '@/command-menu/components/CommandMenuMultipleRecordsInfo';
import { CommandMenuObjectViewRecordInfo } from '@/command-menu/components/CommandMenuObjectViewRecordInfo';
import { CommandMenuPageInfoLayout } from '@/command-menu/components/CommandMenuPageInfoLayout';
import { CommandMenuPageLayoutInfo } from '@/command-menu/components/CommandMenuPageLayoutInfo';
import { CommandMenuRecordInfo } from '@/command-menu/components/CommandMenuRecordInfo';
import { CommandMenuWorkflowStepInfo } from '@/command-menu/components/CommandMenuWorkflowStepInfo';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useWorkspaceSectionItems } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SidePanelPages } from 'twenty-shared/types';

import { type CommandMenuContextChipProps } from './CommandMenuContextChip';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme';

const StyledPageTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

type CommandMenuPageInfoProps = {
  pageChip: CommandMenuContextChipProps | undefined;
};

export const CommandMenuPageInfo = ({ pageChip }: CommandMenuPageInfoProps) => {
  const { theme } = useContext(ThemeContext);
  const selectedNavigationMenuItemInEditMode = useAtomStateValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const items = useWorkspaceSectionItems();

  if (!isDefined(pageChip)) {
    return null;
  }

  const isNavigationMenuItemEditPage =
    pageChip.page?.page === SidePanelPages.NavigationMenuItemEdit;
  const selectedNavItem = isNavigationMenuItemEditPage
    ? items.find((item) => item.id === selectedNavigationMenuItemInEditMode)
    : undefined;

  if (isNavigationMenuItemEditPage && isDefined(selectedNavItem)) {
    const itemType = selectedNavItem.itemType;

    if (itemType === NavigationMenuItemType.FOLDER) {
      return <CommandMenuFolderInfo />;
    }

    if (itemType === NavigationMenuItemType.LINK) {
      return <CommandMenuLinkInfo />;
    }

    if (
      itemType === NavigationMenuItemType.VIEW ||
      itemType === NavigationMenuItemType.RECORD
    ) {
      return <CommandMenuObjectViewRecordInfo />;
    }
  }

  const isRecordPage = pageChip.page?.page === SidePanelPages.ViewRecord;

  if (isRecordPage && isDefined(pageChip.page?.pageId)) {
    return (
      <CommandMenuRecordInfo commandMenuPageInstanceId={pageChip.page.pageId} />
    );
  }

  const isWorkflowStepPage = pageChip.page?.page
    ? [
        SidePanelPages.WorkflowStepEdit,
        SidePanelPages.WorkflowStepView,
        SidePanelPages.WorkflowRunStepView,
      ].includes(pageChip.page?.page)
    : false;

  if (isWorkflowStepPage && isDefined(pageChip.page?.pageId)) {
    return (
      <CommandMenuWorkflowStepInfo
        key={pageChip.page.pageId}
        commandMenuPageInstanceId={pageChip.page.pageId}
      />
    );
  }

  const isPageLayoutPage = pageChip.page?.page
    ? [
        SidePanelPages.PageLayoutWidgetTypeSelect,
        SidePanelPages.PageLayoutGraphTypeSelect,
        SidePanelPages.PageLayoutGraphFilter,
        SidePanelPages.PageLayoutIframeSettings,
        SidePanelPages.PageLayoutTabSettings,
        SidePanelPages.PageLayoutFieldsSettings,
        SidePanelPages.PageLayoutFieldsLayout,
      ].includes(pageChip.page?.page)
    : false;

  if (isPageLayoutPage) {
    return <CommandMenuPageLayoutInfo />;
  }

  const isMultipleRecordsPage =
    pageChip.page?.page === SidePanelPages.UpdateRecords;

  if (isMultipleRecordsPage && isDefined(pageChip.page?.pageId)) {
    return (
      <CommandMenuMultipleRecordsInfo
        commandMenuPageInstanceId={pageChip.page.pageId}
      />
    );
  }

  const isAskAIPage = pageChip.page?.page === SidePanelPages.AskAI;

  if (isAskAIPage) {
    return <CommandMenuAskAIInfo />;
  }

  if (pageChip.page?.page === SidePanelPages.NavigationMenuAddItem) {
    return (
      <CommandMenuPageInfoLayout
        icon={
          <IconColumnInsertRight
            size={theme.icon.size.md}
            color={theme.font.color.tertiary}
          />
        }
        title={<OverflowingTextWithTooltip text={pageChip.text ?? ''} />}
      />
    );
  }

  return (
    <StyledPageTitle>
      <OverflowingTextWithTooltip text={pageChip.text ?? ''} />
    </StyledPageTitle>
  );
};
