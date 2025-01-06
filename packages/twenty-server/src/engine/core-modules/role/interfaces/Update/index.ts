import { UpdateRoleInput } from 'src/engine/core-modules/role/inputs';
import { Role } from 'src/engine/core-modules/role/role.entity';
import { ServiceFn } from 'src/utils/generics';

export type UpdateRoleArgs = {
  id: string;
  data: UpdateRoleInput;
};

export type UpdateRoleResult = Role;

export type UpdateRoleHandler = ServiceFn<
  Promise<UpdateRoleResult>,
  UpdateRoleArgs
>;
