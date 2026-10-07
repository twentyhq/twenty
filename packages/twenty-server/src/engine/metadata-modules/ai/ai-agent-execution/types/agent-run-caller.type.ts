import { type ActorMetadata } from 'twenty-shared/types';

// who started a run and waits on its outcome; stored with a suspended run, so the engine
// can call it back without knowing what the ref means
export type AgentRunCaller =
  | {
      type: 'WORKFLOW_STEP';
      ref: { workflowRunId: string; stepId: string };
    }
  | {
      type: 'AGENT_TRIGGER';
      ref: { agentId: string; triggerId: string; dispatchedRoleId?: string };
    }
  | {
      type: 'AGENT_API_RUN';
      ref: {
        agentId: string;
        runAsWorkspaceMemberId: string | null;
        requestUserWorkspaceId: string | null;
        // the request's own actor cannot be read back once it is over
        createdBy: ActorMetadata;
      };
    };
