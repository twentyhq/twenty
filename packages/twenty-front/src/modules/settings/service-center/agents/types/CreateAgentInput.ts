export interface CreateAgentInput {
  isAdmin: boolean;
  isActive?: boolean;
  memberId: string;
  sectorIds: string[];
  inboxesIds: string[];
  workspaceId: string;
}
