// who may follow a run by its id: the caller that started it, never the workspace at large
export type AgentRunStreamOwner =
  | {
      kind: 'application';
      applicationId: string;
      workspaceMemberId: string | null;
    }
  | {
      kind: 'workspaceMember';
      workspaceMemberId: string;
    };
