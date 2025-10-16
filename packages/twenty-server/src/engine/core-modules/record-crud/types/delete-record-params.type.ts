import { type RoleContext } from 'src/engine/metadata-modules/role/types/role-context.type';

export type DeleteRecordParams = {
  objectName: string;
  objectRecordId: string;
  workspaceId: string;
  roleContext?: RoleContext;
  soft?: boolean;
};
