import { type TranslatableApplicationConfig } from '@/sdk/define/application/application-config';
import { type CommandMenuItemConfig } from '@/sdk/define/command-menu-items/command-menu-item-config';
import { type LooseEnumValues } from '@/sdk/define/common/types/loose-enum-values.type';
import { type TranslatableFrontComponentConfig } from '@/sdk/define/front-component/front-component-config';
import { type TranslatableSettingsFrontComponentConfig } from '@/sdk/define/front-component/settings-front-component-config';
import { type IndexConfig } from '@/sdk/define/indexes/index-config';
import { type TranslatableLogicFunctionConfig } from '@/sdk/define/logic-functions/logic-function-config';
import { type TranslatableHealthCheckLogicFunctionConfig } from '@/sdk/define/logic-functions/health-check-logic-function-config';
import { type TranslatableObjectConfig } from '@/sdk/define/objects/object-config';
import { type PageLayoutConfig } from '@/sdk/define/page-layouts/page-layout-config';
import { type PageLayoutTabConfig } from '@/sdk/define/page-layouts/page-layout-tab-config';
import { type TranslatablePermissionFlagConfig } from '@/sdk/define/permission-flags/permission-flag-config';
import { type ViewConfig } from '@/sdk/define/views/view-config';
import { type TranslatablePostInstallLogicFunctionConfig } from '@/sdk/define/logic-functions/post-install-logic-function-config';
import { type TranslatablePreInstallLogicFunctionConfig } from '@/sdk/define/logic-functions/pre-install-logic-function-config';
import { type TranslatableUninstallLogicFunctionConfig } from '@/sdk/define/logic-functions/uninstall-logic-function-config';
import { type TranslatableRoleConfig } from '@/sdk/define/roles/role-config';
import { type TranslatableAgentConfig } from '@/sdk/define/agents/agent-config';
import { type TranslatableConnectionProviderConfig } from '@/sdk/define/connection-providers/connection-provider-config';
import { type TranslatableSkillConfig } from '@/sdk/define/skills/skill-config';
import { type SettingsMenuItemConfig } from '@/sdk/define/settings-menu-items/settings-menu-item-config';
import { type TranslatableFieldManifest } from '@/sdk/define/common/types/translatable-text.type';
import {
  type NavigationMenuItemManifest,
  type StandalonePageLayoutWidgetManifest,
  type StandaloneViewFieldManifest,
} from 'twenty-shared/application';

export type ValidationResult<T> = {
  success: boolean;
  config: T;
  errors: string[];
  warnings?: string[];
};

export type DefinableEntity =
  | TranslatableApplicationConfig
  | TranslatableObjectConfig
  | TranslatableFieldManifest
  | TranslatableFrontComponentConfig
  | TranslatableSettingsFrontComponentConfig
  | IndexConfig
  | TranslatableLogicFunctionConfig
  | TranslatablePostInstallLogicFunctionConfig
  | TranslatablePreInstallLogicFunctionConfig
  | TranslatableUninstallLogicFunctionConfig
  | TranslatableHealthCheckLogicFunctionConfig
  | TranslatableAgentConfig
  | TranslatableConnectionProviderConfig
  | TranslatableRoleConfig
  | TranslatableSkillConfig
  | ViewConfig
  | StandaloneViewFieldManifest
  | NavigationMenuItemManifest
  | PageLayoutConfig
  | PageLayoutTabConfig
  | StandalonePageLayoutWidgetManifest
  | TranslatablePermissionFlagConfig
  | CommandMenuItemConfig
  | SettingsMenuItemConfig;

export type DefineEntity<T extends DefinableEntity = DefinableEntity> = (
  config: LooseEnumValues<T>,
) => ValidationResult<LooseEnumValues<T>>;
