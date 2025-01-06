import { ServiceFn } from 'src/utils/generics';
import { Role } from "../../role.entity";

export type FindOneRoleArgs = {
  id: string;
};

export type FindOneRoleHandler = ServiceFn<Promise<Role | null>, FindOneRoleArgs>;
