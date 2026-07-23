import { type MetadataApiClient } from 'twenty-client-sdk/metadata';

export function assignWorkspaceMemberRole(
  client: MetadataApiClient,
  workspaceMemberId: string,
  roleId: string,
) {
  return client.mutation({
    updateWorkspaceMemberRole: { __args: { workspaceMemberId, roleId }, id: true },
  });
}
