import {
  type CommandMenuContextApi,
  type ConditionalDisplayDevice,
} from 'twenty-shared/types';

export type ConditionalDisplayEvaluationContext =
  Partial<CommandMenuContextApi> & {
    currentRoleId?: string | null;
    currentWorkspaceMemberId?: string | null;
    device?: ConditionalDisplayDevice | null;
  };
