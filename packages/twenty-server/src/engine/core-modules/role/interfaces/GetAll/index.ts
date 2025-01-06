import { Role } from 'src/engine/core-modules/role/role.entity';
import { ServiceFn } from 'src/utils/generics';

export type GetAllRolesArgs = {
  workspaceId: string;
};

export type GetAllRolesHandler = ServiceFn<Promise<Role[]>, GetAllRolesArgs>;
