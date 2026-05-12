import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconColumnInsertRight,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';

import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { SidePanelAskAiInfo } from '@/side-panel/components/SidePanelAskAiInfo';
import { SidePanelFolderInfo } from '@/side-panel/components/SidePanelFolderInfo';
import { SidePanelLinkInfo } from '@/side-panel/components/SidePanelLinkInfo';
import { SidePanelMultipleRecordsInfo } from '@/side-panel/components/SidePanelMultipleRecordsInfo';
import { SidePanelObjectViewRecordInfo } from '@/side-panel/components/SidePanelObjectViewRecordInfo';
import { SidePanelPageInfoLayout } from '@/side-panel/components/SidePanelPageInfoLayout';
import { SidePanelPageLayoutInfo } from '@/side-panel/components/SidePanelPageLayoutInfo';
import { SidePanelRecordInfo } from '@/side-panel/components/SidePanelRecordInfo';
import { SidePanelWorkflowStepInfo } from '@/side-panel/components/SidePanelWorkflowStepInfo';
import { isPageLayoutSidePanelPage } from '@/side-panel/pages/page-layout/utils/isPageLayoutSidePanelPage';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { NavigationMenuItemType, SidePanelPages } from 'twenty-shared/types';

import { type SidePanelContextChipProps } from '@/side-panel/components/SidePanelContextChip';
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
const StyledPageTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

type SidePanelPageInfoProps = {
  pageChip: SidePanelContextChipProps | undefined;
};

export const SidePanelPageInfo = ({ pageChip }: SidePanelPageInfoProps) => {
  const { theme } = useContext(ThemeContext);
  const selectedNavigationMenuItemIdInEditMode = useAtomStateValue(
    selectedNavigationMenuItemIdInEditModeState,
  );
  const items = useNavigationMenuItemSectionItems();

  if (!isDefined(pageChip)) {
    return null;
  }

  const isNavigationMenuItemEditPage =
    pageChip.page?.page === SidePanelPages.NavigationMenuItemEdit;
  const selectedNavItem = isNavigationMenuItemEditPage
    ? items.find((item) => item.id === selectedNavigationMenuItemIdInEditMode)
    : undefined;

  if (isNavigationMenuItemEditPage && isDefined(selectedNavItem)) {
    const navItemType = selectedNavItem.type;

    if (navItemType === NavigationMenuItemType.FOLDER) {
      return <SidePanelFolderInfo />;
    }

    if (navItemType === NavigationMenuItemType.LINK) {
      return <SidePanelLinkInfo />;
    }

    if (
      navItemType === NavigationMenuItemType.OBJECT ||
      navItemType === NavigationMenuItemType.VIEW ||
      navItemType === NavigationMenuItemType.RECORD
    ) {
      return <SidePanelObjectViewRecordInfo />;
    }
  }

  const isRecordPage = pageChip.page?.page === SidePanelPages.ViewRecord;

  if (isRecordPage && isDefined(pageChip.page?.pageId)) {
    return (
      <SidePanelRecordInfo sidePanelPageInstanceId={pageChip.page.pageId} />
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
      <SidePanelWorkflowStepInfo
        key={pageChip.page.pageId}
        sidePanelPageInstanceId={pageChip.page.pageId}
      />
    );
  }

  const isPageLayoutPage = pageChip.page?.page
    ? isPageLayoutSidePanelPage(pageChip.page.page)
    : false;

  if (isPageLayoutPage) {
    return <SidePanelPageLayoutInfo />;
  }

  const isMultipleRecordsPage =
    pageChip.page?.page === SidePanelPages.UpdateRecords;

  if (isMultipleRecordsPage && isDefined(pageChip.page?.pageId)) {
    return (
      <SidePanelMultipleRecordsInfo
        sidePanelPageInstanceId={pageChip.page.pageId}
      />
    );
  }

  const isAskAiPage = pageChip.page?.page === SidePanelPages.AskAI;

  if (isAskAiPage) {
    return <SidePanelAskAiInfo />;
  }

  if (pageChip.page?.page === SidePanelPages.NavigationMenuAddItem) {
    return (
      <SidePanelPageInfoLayout
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
