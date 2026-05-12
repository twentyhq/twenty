import { type ApplicationConfig } from '@/sdk/define/application/application-config';
import { type CommandMenuItemConfig } from '@/sdk/define/command-menu-items/command-menu-item-config';
import { type FrontComponentConfig } from '@/sdk/define/front-component/front-component-config';
import { type LogicFunctionConfig } from '@/sdk/define/logic-functions/logic-function-config';
import { type ObjectConfig } from '@/sdk/define/objects/object-config';
import { type PageLayoutConfig } from '@/sdk/define/page-layouts/page-layout-config';
import { type PageLayoutTabConfig } from '@/sdk/define/page-layouts/page-layout-tab-config';
import { type ViewConfig } from '@/sdk/define/views/view-config';
import { type PostInstallLogicFunctionConfig } from '@/sdk/define/logic-functions/post-install-logic-function-config';
import { type PreInstallLogicFunctionConfig } from '@/sdk/define/logic-functions/pre-install-logic-function-config';
import { type RoleConfig } from '@/sdk/define/roles/role-config';
import {
  type AgentManifest,
  type ConnectionProviderManifest,
  type FieldManifest,
  type NavigationMenuItemManifest,
  type SkillManifest,
} from 'twenty-shared/application';

export type ValidationResult<T> = {
  success: boolean;
  config: T;
  errors: string[];
  warnings?: string[];
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
  | ConnectionProviderManifest
  | RoleConfig
  | SkillManifest
  | ViewConfig
  | NavigationMenuItemManifest
  | PageLayoutConfig
  | PageLayoutTabConfig
  | CommandMenuItemConfig;

export type DefineEntity<T extends DefinableEntity = DefinableEntity> = (
  config: T,
) => ValidationResult<T>;
