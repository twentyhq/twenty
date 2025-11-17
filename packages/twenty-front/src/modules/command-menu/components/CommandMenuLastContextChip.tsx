import { CommandMenuRecordInfo } from '@/command-menu/components/CommandMenuRecordInfo';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { isDefined } from 'twenty-shared/utils';
import {
  CommandMenuContextChip,
  type CommandMenuContextChipProps,
} from './CommandMenuContextChip';

type CommandMenuLastContextChipProps = {
  lastChip: CommandMenuContextChipProps | undefined;
};

export const CommandMenuLastContextChip = ({
  lastChip,
}: CommandMenuLastContextChipProps) => {
  if (!isDefined(lastChip)) {
    return null;
  }

  const isLastChipRecordPage =
    lastChip.page?.page === CommandMenuPages.ViewRecord;

  if (isLastChipRecordPage && isDefined(lastChip.page?.pageId)) {
    return (
      <CommandMenuRecordInfo commandMenuPageInstanceId={lastChip.page.pageId} />
    );
  }

  return (
    <CommandMenuContextChip
      Icons={lastChip.Icons}
      maxWidth="180px"
      onClick={lastChip.onClick}
      text={lastChip.text}
    />
  );
};

