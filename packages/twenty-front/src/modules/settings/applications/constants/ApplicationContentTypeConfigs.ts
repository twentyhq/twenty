import { msg } from '@lingui/core/macro';
import {
  CommandMenuItemAvailabilityType,
  PageLayoutType,
} from 'twenty-shared/types';
import {
  IconAppWindow,
  IconBook,
  IconBox,
  IconBrandTypescript,
  IconCommand,
  IconCompass,
  IconFlag,
  IconKey,
  IconLanguage,
  IconLayoutGridAdd,
  IconLayoutNavbar,
  IconLego,
  IconListDetails,
  IconListSearch,
  IconLock,
  IconPhoto,
  IconPlug,
  IconSettingsAutomation,
  IconTable,
} from 'twenty-ui/icon';

import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { type ApplicationContentTypeConfig } from '@/settings/applications/types/ApplicationContentTypeConfig';

export const APPLICATION_CONTENT_TYPE_CONFIGS: Record<
  ApplicationContentType,
  ApplicationContentTypeConfig
> = {
  objects: {
    label: msg`Objects`,
    description: msg`Record schemas and their behavior`,
    Icon: IconBox,
    secondaryColumn: { label: msg`Description`, source: 'description' },
    countColumnLabel: msg`Fields`,
  },
  fields: {
    label: msg`Fields`,
    description: msg`Properties and relations contributed to objects`,
    Icon: IconListSearch,
    secondaryColumn: { label: msg`Object`, source: 'object' },
    countColumnLabel: msg`Views`,
  },
  indexes: {
    label: msg`Indexes`,
    description: msg`Declarable constraints and lookup indexes`,
    Icon: IconKey,
    secondaryColumn: { label: msg`Object`, source: 'object' },
    countColumnLabel: msg`Fields`,
  },
  views: {
    label: msg`Views`,
    description: msg`Saved table, board and calendar configurations`,
    Icon: IconTable,
    secondaryColumn: { label: msg`Object`, source: 'object' },
    countColumnLabel: msg`Fields`,
  },
  viewFields: {
    label: msg`View fields`,
    description: msg`Field visibility and order inside views`,
    Icon: IconListDetails,
    secondaryColumn: { label: msg`View`, source: 'parent' },
    countColumnLabel: msg`Position`,
  },
  pageLayouts: {
    label: msg`Page layouts`,
    description: msg`Reusable record and standalone page structures`,
    Icon: IconAppWindow,
    secondaryColumn: { label: msg`Type`, source: 'tag' },
    countColumnLabel: msg`Tabs`,
    tags: {
      [PageLayoutType.RECORD_PAGE]: { label: msg`Record`, color: 'blue' },
      [PageLayoutType.RECORD_INDEX]: { label: msg`Index`, color: 'sky' },
      [PageLayoutType.RECORD_FORM]: { label: msg`Form`, color: 'turquoise' },
      [PageLayoutType.DASHBOARD]: { label: msg`Dashboard`, color: 'orange' },
      [PageLayoutType.STANDALONE_PAGE]: {
        label: msg`Standalone`,
        color: 'purple',
      },
    },
  },
  pageLayoutTabs: {
    label: msg`Page layout tabs`,
    description: msg`Declarable tabs within a page layout`,
    Icon: IconLayoutNavbar,
    secondaryColumn: { label: msg`Layout`, source: 'parent' },
    countColumnLabel: msg`Widgets`,
  },
  navigationMenuItems: {
    label: msg`Navigation items`,
    description: msg`Proposed placements in the workspace sidebar`,
    Icon: IconCompass,
    secondaryColumn: { label: msg`Folder`, source: 'parent' },
    countColumnLabel: msg`Position`,
  },
  commandMenuItems: {
    label: msg`Command menu items`,
    description: msg`Actions exposed through the command menu`,
    Icon: IconCommand,
    secondaryColumn: { label: msg`Scope`, source: 'tag' },
    tags: {
      [CommandMenuItemAvailabilityType.RECORD_SELECTION]: {
        label: msg`Record`,
        color: 'blue',
      },
      [CommandMenuItemAvailabilityType.GLOBAL]: {
        label: msg`Global`,
        color: 'purple',
      },
      [CommandMenuItemAvailabilityType.GLOBAL_OBJECT_CONTEXT]: {
        label: msg`Object`,
        color: 'sky',
      },
      [CommandMenuItemAvailabilityType.FALLBACK]: {
        label: msg`Fallback`,
        color: 'gray',
      },
    },
  },
  frontComponents: {
    label: msg`Widgets & front components`,
    description: msg`App-provided widgets, panels and interface components`,
    Icon: IconLayoutGridAdd,
    secondaryColumn: { label: msg`Type`, source: 'tag' },
    countColumnLabel: msg`Placements`,
    tags: {
      WIDGET: { label: msg`Widget`, color: 'blue' },
      FRONT_COMPONENT: { label: msg`Front component`, color: 'purple' },
    },
  },
  workflows: {
    label: msg`Workflows`,
    description: msg`User-facing automations with a canonical app editor`,
    Icon: IconSettingsAutomation,
    secondaryColumn: { label: msg`Status`, source: 'tag' },
    tags: {
      ACTIVE: { label: msg`Active`, color: 'green' },
      DRAFT: { label: msg`Draft`, color: 'gray' },
    },
  },
  logicFunctions: {
    label: msg`Logic functions`,
    description: msg`Executable functions used by apps and automations`,
    Icon: IconBrandTypescript,
    secondaryColumn: { label: msg`Trigger`, source: 'tag' },
    tags: {
      DATABASE_EVENT: { label: msg`Database event`, color: 'blue' },
      HTTP_ROUTE: { label: msg`HTTP route`, color: 'purple' },
      SERVER_ROUTE: { label: msg`Server route`, color: 'iris' },
      CRON: { label: msg`Schedule`, color: 'orange' },
      TOOL: { label: msg`Tool`, color: 'turquoise' },
      WORKFLOW_ACTION: { label: msg`Workflow action`, color: 'green' },
    },
  },
  agents: {
    label: msg`Agents`,
    description: msg`Reusable AI actors that can also serve end users`,
    Icon: IconLego,
    secondaryColumn: { label: msg`Description`, source: 'description' },
  },
  skills: {
    label: msg`Skills`,
    description: msg`Instruction and capability packages for agents`,
    Icon: IconBook,
    secondaryColumn: { label: msg`Description`, source: 'description' },
  },
  roles: {
    label: msg`Roles`,
    description: msg`Permission bundles that apps can contribute`,
    Icon: IconLock,
    secondaryColumn: { label: msg`Description`, source: 'description' },
    countColumnLabel: msg`Members`,
  },
  permissionFlags: {
    label: msg`Permission flags`,
    description: msg`Declarable feature-level access controls`,
    Icon: IconFlag,
    secondaryColumn: { label: msg`Type`, source: 'tag' },
    countColumnLabel: msg`Roles`,
    tags: {
      settings: { label: msg`Settings`, color: 'blue' },
      tool: { label: msg`Tool`, color: 'purple' },
    },
  },
  connectionProviders: {
    label: msg`Connection providers`,
    description: msg`External account and credential definitions`,
    Icon: IconPlug,
    secondaryColumn: { label: msg`Type`, source: 'tag' },
    tags: {
      oauth: { label: msg`OAuth`, color: 'blue' },
      custom: { label: msg`Custom`, color: 'purple' },
    },
  },
  publicAssets: {
    label: msg`Public assets`,
    description: msg`Images and files packaged with applications`,
    Icon: IconPhoto,
    secondaryColumn: { label: msg`Type`, source: 'tag' },
    tags: {
      IMAGE: { label: msg`Image`, color: 'blue' },
      FILE: { label: msg`File`, color: 'purple' },
    },
  },
  translations: {
    label: msg`Translations`,
    description: msg`Localized labels and interface copy`,
    Icon: IconLanguage,
    countColumnLabel: msg`Keys`,
  },
};
