import { CommandMenuRecordInfo } from '@/command-menu/components/CommandMenuRecordInfo';
import { CommandMenuWorkflowStepInfo } from '@/command-menu/components/CommandMenuWorkflowStepInfo';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { isDefined } from 'twenty-shared/utils';
import {
  CommandMenuContextChip,
  type CommandMenuContextChipProps,
} from './CommandMenuContextChip';

type CommandMenuPageInfoProps = {
  pageChip: CommandMenuContextChipProps | undefined;
};

export const CommandMenuPageInfo = ({ pageChip }: CommandMenuPageInfoProps) => {
  if (!isDefined(pageChip)) {
    return null;
  }

  const isRecordPage = pageChip.page?.page === CommandMenuPages.ViewRecord;

  if (isRecordPage && isDefined(pageChip.page?.pageId)) {
    return (
      <CommandMenuRecordInfo commandMenuPageInstanceId={pageChip.page.pageId} />
    );
  }

  const isWorkflowStepPage =
    pageChip.page?.page === CommandMenuPages.WorkflowStepEdit ||
    pageChip.page?.page === CommandMenuPages.WorkflowStepView ||
    pageChip.page?.page === CommandMenuPages.WorkflowRunStepView;

  if (isWorkflowStepPage && isDefined(pageChip.page?.pageId)) {
    return (
      <CommandMenuWorkflowStepInfo
        commandMenuPageInstanceId={pageChip.page.pageId}
      />
    );
  }

  return (
    <CommandMenuContextChip
      Icons={pageChip.Icons}
      maxWidth="180px"
      onClick={pageChip.onClick}
      text={pageChip.text}
    />
  );
};
