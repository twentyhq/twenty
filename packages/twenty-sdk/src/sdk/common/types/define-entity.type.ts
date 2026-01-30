import {
  type ApplicationManifest,
  type FieldManifest,
  type ObjectManifest,
  type RoleManifest,
} from 'twenty-shared/application';
import { type FrontComponentConfig } from '@/sdk/front-components/front-component-config';
import { type LogicFunctionConfig } from '@/sdk/logic-functions/logic-function-config';

export type ValidationResult<T> = {
  success: boolean;
  config: T;
  errors: string[];
};

export type DefinableEntity =
  | ApplicationManifest
  | ObjectManifest
  | FieldManifest
  | FrontComponentConfig
  | LogicFunctionConfig
  | RoleManifest;

export type DefineEntity<C extends DefinableEntity = DefinableEntity> = <
  T extends C,
>(
  config: T,
) => ValidationResult<T>;
