import { createHmac } from 'node:crypto';

// Keyed so a published metric row cannot be matched back to a workspace id without the server secret
export const hashWorkspaceIdForApplicationRegistrationMetric = ({
  workspaceId,
  secret,
}: {
  workspaceId: string;
  secret: string;
}): string => createHmac('sha256', secret).update(workspaceId).digest('hex');
