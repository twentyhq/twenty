import { CreateRoleInput } from 'src/engine/core-modules/role/inputs';
import { Role } from 'src/engine/core-modules/role/role.entity';
import { ServiceFn } from 'src/utils/generics';

export type CreateRoleArgs = CreateRoleInput;

export type CreateRoleResult = Role

export type CreateRoleHandler = ServiceFn<
  Promise<CreateRoleResult>,
  CreateRoleArgs
>;
