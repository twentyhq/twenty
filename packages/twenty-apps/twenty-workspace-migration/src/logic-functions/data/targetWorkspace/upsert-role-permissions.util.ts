import { type AxiosInstance } from "axios";
import { postGraphql } from "src/logic-functions/data/targetWorkspace/graphql-client.util";

// These three upsert mutations replace the create-many-with-shared-{id}-return shape
// createMetadataEntity handles: each has its own arg name and a different, non-`id`-shaped
// return type (ObjectPermissionDTO has no `id` at all), and none of the responses are needed
// by the caller here, so they're not worth forcing through that shared helper.

export const upsertPermissionFlags = async (
  client: AxiosInstance,
  roleId: string,
  permissionFlagKeys: string[],
): Promise<void> => {
  const mutation = `mutation UpsertPermissionFlags($upsertPermissionFlagsInput: UpsertPermissionFlagsInput!) {
  upsertPermissionFlags(upsertPermissionFlagsInput: $upsertPermissionFlagsInput) {
    id
  }
}`;

  await postGraphql(client, '/metadata', 'UpsertPermissionFlags', mutation, {
    upsertPermissionFlagsInput: { roleId, permissionFlagKeys },
  });
}

export const upsertObjectPermissions = async (
  client: AxiosInstance,
  roleId: string,
  objectPermissions: Record<string, unknown>[],
): Promise<void> => {
  const mutation = `mutation UpsertObjectPermissions($upsertObjectPermissionsInput: UpsertObjectPermissionsInput!) {
  upsertObjectPermissions(upsertObjectPermissionsInput: $upsertObjectPermissionsInput) {
    objectMetadataId
  }
}`;

  await postGraphql(client, '/metadata', 'UpsertObjectPermissions', mutation, {
    upsertObjectPermissionsInput: { roleId, objectPermissions },
  });
}

export const upsertFieldPermissions = async (
  client: AxiosInstance,
  roleId: string,
  fieldPermissions: Record<string, unknown>[],
): Promise<void> => {
  const mutation = `mutation UpsertFieldPermissions($upsertFieldPermissionsInput: UpsertFieldPermissionsInput!) {
  upsertFieldPermissions(upsertFieldPermissionsInput: $upsertFieldPermissionsInput) {
    id
  }
}`;

  await postGraphql(client, '/metadata', 'UpsertFieldPermissions', mutation, {
    upsertFieldPermissionsInput: { roleId, fieldPermissions },
  });
}
