import { type ApplicationConfig } from '@/sdk/application/application-config';
import { type FrontComponentConfig } from '@/sdk/front-component-config';
import { type LogicFunctionConfig } from '@/sdk/logic-functions/logic-function-config';
import {
  type FieldManifest,
  type ObjectManifest,
  type RoleManifest,
} from 'twenty-shared/application';

export type ValidationResult<T> = {
  success: boolean;
  config: T;
  errors: string[];
};

export type DefinableEntity =
  | ApplicationConfig
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
