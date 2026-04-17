import { type ApplicationConfig } from '@/sdk/application/application-config';
import { type FrontComponentConfig } from '@/sdk/front-component-config';
import { type LogicFunctionConfig } from '@/sdk/logic-functions/logic-function-config';
import { type ObjectConfig } from '@/sdk/objects/object-config';
import { type PageLayoutConfig } from '@/sdk/page-layouts/page-layout-config';
import { type ViewConfig } from '@/sdk/views/view-config';
import { type PostInstallLogicFunctionConfig } from '@/sdk/logic-functions/post-install-logic-function-config';
import { type PreInstallLogicFunctionConfig } from '@/sdk/logic-functions/pre-install-logic-function-config';
import { type RoleConfig } from '@/sdk/roles/role-config';
import {
  type AgentManifest,
  type FieldManifest,
  type NavigationMenuItemManifest,
  type SkillManifest,
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
  | PostInstallLogicFunctionConfig
  | PreInstallLogicFunctionConfig
  | AgentManifest
  | RoleConfig
  | SkillManifest
  | ViewConfig
  | NavigationMenuItemManifest
  | PageLayoutConfig;

export type DefineEntity<T extends DefinableEntity = DefinableEntity> = (
  config: T,
) => ValidationResult<T>;
