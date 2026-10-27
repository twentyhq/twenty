import { isDefined } from 'twenty-shared/utils';

import { SidePanelAskAiInfo } from '@/side-panel/components/SidePanelAskAiInfo';
import { SidePanelMultipleRecordsInfo } from '@/side-panel/components/SidePanelMultipleRecordsInfo';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { SidePanelPageLayoutInfo } from '@/side-panel/components/SidePanelPageLayoutInfo';
import { SidePanelSendCampaignInfo } from '@/side-panel/components/SidePanelSendCampaignInfo';
import { SidePanelWorkflowStepInfo } from '@/side-panel/components/SidePanelWorkflowStepInfo';
import { SidePanelPages } from 'twenty-shared/types';
import { useTheme } from 'twenty-ui/theme';

import { type SidePanelContextChipProps } from '@/side-panel/types/SidePanelContextChipProps';

type SidePanelPageInfoProps = {
  pageChip: SidePanelContextChipProps | undefined;
};

export const SidePanelPageInfo = ({ pageChip }: SidePanelPageInfoProps) => {
  const theme = useTheme();

  if (!isDefined(pageChip)) {
    return null;
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

  const pageLayoutSidePanelTarget = pageChip.page?.pageLayoutSidePanelTarget;

  if (isDefined(pageLayoutSidePanelTarget)) {
    return (
      <SidePanelPageLayoutInfo
        pageLayoutId={pageLayoutSidePanelTarget.pageLayoutId}
      />
    );
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

  const isSendCampaignPage =
    pageChip.page?.page === SidePanelPages.SendCampaign;

  if (isSendCampaignPage && isDefined(pageChip.page?.pageId)) {
    return (
      <SidePanelSendCampaignInfo
        sidePanelPageInstanceId={pageChip.page.pageId}
      />
    );
  }

  const isAskAiPage = pageChip.page?.page === SidePanelPages.AskAI;

  if (isAskAiPage) {
    return <SidePanelAskAiInfo />;
  }

  const shouldShowPageIcon = pageChip.page?.page
    ? [
        SidePanelPages.EmailBlockSettings,
        SidePanelPages.EmailPageStyle,
        SidePanelPages.EmailBlockStyle,
        SidePanelPages.AddToMessageList,
        SidePanelPages.ShareRecord,
      ].includes(pageChip.page.page)
    : false;

  if (shouldShowPageIcon && isDefined(pageChip.page)) {
    const PageIcon = pageChip.page.pageIcon;

    return (
      <HeaderIdentifier
        icon={
          <PageIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        }
        iconColor={theme.font.color.tertiary}
        title={pageChip.text ?? ''}
      />
    );
  }

  return <HeaderIdentifier title={pageChip.text ?? ''} />;
};
