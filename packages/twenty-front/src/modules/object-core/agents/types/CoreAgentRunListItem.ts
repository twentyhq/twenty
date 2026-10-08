import { type CoreAgentRun } from '@/object-core/agents/types/CoreAgentRun';

export type CoreAgentRunListItem<
  TRun extends Pick<CoreAgentRun, 'threadId' | 'threadTitle'> = CoreAgentRun,
> =
  | { type: 'run'; run: TRun }
  | {
      type: 'conversation';
      threadId: string;
      title: string | null;
      runs: TRun[];
    };
