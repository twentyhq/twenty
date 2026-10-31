import { z } from 'zod';

// neither set means the call acts as the application it comes through
export const agentRunCallerRefSchema = z.object({
  callerWorkspaceMemberId: z.string().optional(),
  callerApiKeyId: z.string().optional(),
});

export type AgentRunCallerRef = z.infer<typeof agentRunCallerRefSchema>;
