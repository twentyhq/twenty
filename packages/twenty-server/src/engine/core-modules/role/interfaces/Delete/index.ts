import { ServiceFn } from 'src/utils/generics';

export type DeleteRoleArgs = {
  id: string;
};

export type DeleteRoleHandler = ServiceFn<Promise<boolean>, DeleteRoleArgs>;
