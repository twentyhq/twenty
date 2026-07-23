import { type MetadataApiClient } from 'twenty-client-sdk/metadata';

export function getRolesWithMembers(client: MetadataApiClient) {
  return client.query({
    getRoles: { id: true, label: true, workspaceMembers: { id: true } },
  });
}
