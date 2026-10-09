import { isDefined } from 'twenty-shared/utils';

import { SidePanelAskAiInfo } from '@/side-panel/components/SidePanelAskAiInfo';
import { SidePanelMultipleRecordsInfo } from '@/side-panel/components/SidePanelMultipleRecordsInfo';
import { HeaderIdentifier } from '@/ui/layout/page/components/HeaderIdentifier';
import { SidePanelPageLayoutInfo } from '@/side-panel/components/SidePanelPageLayoutInfo';
import { SidePanelWorkflowStepInfo } from '@/side-panel/components/SidePanelWorkflowStepInfo';
import { SidePanelPages } from 'twenty-shared/types';

import { type SidePanelContextChipProps } from '@/side-panel/components/SidePanelContextChip';

type SidePanelPageInfoProps = {
  pageChip: SidePanelContextChipProps | undefined;
};

export const SidePanelPageInfo = ({ pageChip }: SidePanelPageInfoProps) => {
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

  const isAskAiPage = pageChip.page?.page === SidePanelPages.AskAI;

  if (isAskAiPage) {
    return <SidePanelAskAiInfo />;
  }

  return <HeaderIdentifier title={pageChip.text ?? ''} />;
};
