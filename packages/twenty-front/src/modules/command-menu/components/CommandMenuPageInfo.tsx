import styled from '@emotion/styled';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

import { CommandMenuAskAIInfo } from '@/command-menu/components/CommandMenuAskAIInfo';
import { CommandMenuFolderInfo } from '@/command-menu/components/CommandMenuFolderInfo';
import { CommandMenuLinkInfo } from '@/command-menu/components/CommandMenuLinkInfo';
import { CommandMenuMultipleRecordsInfo } from '@/command-menu/components/CommandMenuMultipleRecordsInfo';
import { CommandMenuObjectViewRecordInfo } from '@/command-menu/components/CommandMenuObjectViewRecordInfo';
import { CommandMenuPageLayoutInfo } from '@/command-menu/components/CommandMenuPageLayoutInfo';
import { CommandMenuRecordInfo } from '@/command-menu/components/CommandMenuRecordInfo';
import { CommandMenuWorkflowStepInfo } from '@/command-menu/components/CommandMenuWorkflowStepInfo';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useWorkspaceSectionItems } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeStateV2 } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

import { type CommandMenuContextChipProps } from './CommandMenuContextChip';

const StyledPageTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

type CommandMenuPageInfoProps = {
  pageChip: CommandMenuContextChipProps | undefined;
};

export const CommandMenuPageInfo = ({ pageChip }: CommandMenuPageInfoProps) => {
  const selectedNavigationMenuItemInEditMode = useRecoilValueV2(
    selectedNavigationMenuItemInEditModeStateV2,
  );
  const items = useWorkspaceSectionItems();

  if (!isDefined(pageChip)) {
    return null;
  }

  const isNavigationMenuItemEditPage =
    pageChip.page?.page === CommandMenuPages.NavigationMenuItemEdit;
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

  const isRecordPage = pageChip.page?.page === CommandMenuPages.ViewRecord;

  if (isRecordPage && isDefined(pageChip.page?.pageId)) {
    return (
      <CommandMenuRecordInfo commandMenuPageInstanceId={pageChip.page.pageId} />
    );
  }

  const isWorkflowStepPage = pageChip.page?.page
    ? [
        CommandMenuPages.WorkflowStepEdit,
        CommandMenuPages.WorkflowStepView,
        CommandMenuPages.WorkflowRunStepView,
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
        CommandMenuPages.PageLayoutWidgetTypeSelect,
        CommandMenuPages.PageLayoutGraphTypeSelect,
        CommandMenuPages.PageLayoutGraphFilter,
        CommandMenuPages.PageLayoutIframeSettings,
        CommandMenuPages.PageLayoutTabSettings,
        CommandMenuPages.PageLayoutFieldsSettings,
        CommandMenuPages.PageLayoutFieldsLayout,
      ].includes(pageChip.page?.page)
    : false;

  if (isPageLayoutPage) {
    return <CommandMenuPageLayoutInfo />;
  }

  const isMultipleRecordsPage =
    pageChip.page?.page === CommandMenuPages.UpdateRecords;

  if (isMultipleRecordsPage && isDefined(pageChip.page?.pageId)) {
    return (
      <CommandMenuMultipleRecordsInfo
        commandMenuPageInstanceId={pageChip.page.pageId}
      />
    );
  }

  const isAskAIPage = pageChip.page?.page === CommandMenuPages.AskAI;

  if (isAskAIPage) {
    return <CommandMenuAskAIInfo />;
  }

  return (
    <StyledPageTitle>
      <OverflowingTextWithTooltip text={pageChip.text ?? ''} />
    </StyledPageTitle>
  );
};
