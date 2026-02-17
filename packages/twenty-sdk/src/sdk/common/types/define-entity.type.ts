import { type ApplicationConfig } from '@/sdk/application/application-config';
import { type FrontComponentConfig } from '@/sdk/front-component-config';
import { type LogicFunctionConfig } from '@/sdk/logic-functions/logic-function-config';
import { type ObjectConfig } from '@/sdk/objects/object-config';
import { type ViewConfig } from '@/sdk/views/view-config';
import {
  type FieldManifest,
  type NavigationMenuItemManifest,
  type RoleManifest,
} from 'twenty-shared/application';

export type ValidationResult<T> = {
  success: boolean;
  config: T;
  errors: string[];
};

export type DefinableEntity =
  | ApplicationConfig
  | ObjectConfig
  | FieldManifest
  | FrontComponentConfig
  | LogicFunctionConfig
  | RoleManifest
  | ViewConfig
  | NavigationMenuItemManifest;

export type DefineEntity<T extends DefinableEntity = DefinableEntity> = (
  config: T,
) => ValidationResult<T>;
