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
    description: msg`Types of records in your workspace`,
    Icon: IconBox,
    columns: [
      { label: msg`Description`, source: 'description' },
      {
        label: msg`Fields`,
        source: 'count',
        link: { contentType: 'fields', filter: 'object' },
      },
    ],
  },
  fields: {
    label: msg`Fields`,
    description: msg`Properties and relations added to objects`,
    Icon: IconListSearch,
    columns: [
      { label: msg`Object`, source: 'object' },
      {
        label: msg`Views`,
        source: 'count',
        link: { contentType: 'views', filter: 'field' },
      },
    ],
    filters: ['object'],
  },
  indexes: {
    label: msg`Indexes`,
    description: msg`Speed up search and keep values unique`,
    Icon: IconKey,
    columns: [
      { label: msg`Object`, source: 'object' },
      { label: msg`Fields`, source: 'count' },
    ],
    filters: ['object'],
  },
  views: {
    label: msg`Views`,
    description: msg`Saved tables, boards and calendars`,
    Icon: IconTable,
    columns: [
      { label: msg`Object`, source: 'object' },
      {
        label: msg`Fields`,
        source: 'count',
        link: { contentType: 'viewFields', filter: 'view' },
      },
    ],
    filters: ['object', 'field'],
  },
  viewFields: {
    label: msg`View fields`,
    description: msg`Fields shown in each view, and their order`,
    Icon: IconListDetails,
    columns: [
      { label: msg`View`, source: 'parent' },
      { label: msg`Position`, source: 'position' },
    ],
    filters: ['view'],
  },
  pageLayouts: {
    label: msg`Page layouts`,
    description: msg`Layouts for record pages, dashboards and other pages`,
    Icon: IconAppWindow,
    columns: [
      { label: msg`Type`, source: 'tag' },
      {
        label: msg`Tabs`,
        source: 'count',
        link: { contentType: 'pageLayoutTabs', filter: 'pageLayout' },
      },
    ],
    filters: ['object'],
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
    description: msg`Tabs inside a page layout`,
    Icon: IconLayoutNavbar,
    columns: [
      { label: msg`Layout`, source: 'parent' },
      { label: msg`Widgets`, source: 'count' },
    ],
    filters: ['pageLayout'],
  },
  navigationMenuItems: {
    label: msg`Navigation items`,
    description: msg`Shortcuts in the workspace sidebar`,
    Icon: IconCompass,
    columns: [
      { label: msg`Folder`, source: 'parent' },
      { label: msg`Position`, source: 'position' },
    ],
    filters: ['object'],
  },
  commandMenuItems: {
    label: msg`Command menu items`,
    description: msg`Actions in the command menu`,
    Icon: IconCommand,
    columns: [{ label: msg`Scope`, source: 'tag' }],
    filters: ['object'],
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
    label: msg`Widgets`,
    description: msg`Widgets, panels and other interface components`,
    Icon: IconLayoutGridAdd,
    columns: [
      { label: msg`Type`, source: 'tag' },
      { label: msg`Placements`, source: 'count' },
    ],
    tags: {
      WIDGET: { label: msg`Widget`, color: 'blue' },
      FRONT_COMPONENT: { label: msg`Front component`, color: 'purple' },
    },
  },
  workflows: {
    label: msg`Workflows`,
    description: msg`Automations that run on triggers`,
    Icon: IconSettingsAutomation,
    columns: [{ label: msg`Status`, source: 'tag' }],
    tags: {
      ACTIVE: { label: msg`Active`, color: 'green' },
      DRAFT: { label: msg`Draft`, color: 'gray' },
      DEACTIVATED: { label: msg`Deactivated`, color: 'orange' },
      ARCHIVED: { label: msg`Archived`, color: 'gray' },
    },
  },
  logicFunctions: {
    label: msg`Logic functions`,
    description: msg`Code that apps and workflows run`,
    Icon: IconBrandTypescript,
    columns: [
      { label: msg`Description`, source: 'description' },
      { label: msg`Trigger`, source: 'tag' },
      { label: msg`Timeout`, source: 'duration' },
    ],
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
    description: msg`AI assistants that work for your team`,
    Icon: IconLego,
    columns: [{ label: msg`Description`, source: 'description' }],
  },
  skills: {
    label: msg`Skills`,
    description: msg`Instructions and tools agents can use`,
    Icon: IconBook,
    columns: [{ label: msg`Description`, source: 'description' }],
  },
  roles: {
    label: msg`Roles`,
    description: msg`Sets of permissions you can assign`,
    Icon: IconLock,
    columns: [{ label: msg`Description`, source: 'description' }],
  },
  permissionFlags: {
    label: msg`Permission flags`,
    description: msg`Access to specific features`,
    Icon: IconFlag,
    columns: [
      { label: msg`Type`, source: 'tag' },
      { label: msg`Roles`, source: 'count' },
    ],
    tags: {
      settings: { label: msg`Settings`, color: 'blue' },
      tool: { label: msg`Tool`, color: 'purple' },
    },
  },
  connectionProviders: {
    label: msg`Connection providers`,
    description: msg`Ways to connect external accounts`,
    Icon: IconPlug,
    columns: [{ label: msg`Type`, source: 'tag' }],
    tags: {
      oauth: { label: msg`OAuth`, color: 'blue' },
      custom: { label: msg`Custom`, color: 'purple' },
    },
  },
  publicAssets: {
    label: msg`Public assets`,
    description: msg`Images and files that ship with the app`,
    Icon: IconPhoto,
    columns: [{ label: msg`Type`, source: 'tag' }],
    tags: {
      IMAGE: { label: msg`Image`, color: 'blue' },
      FILE: { label: msg`File`, color: 'purple' },
    },
  },
  translations: {
    label: msg`Translations`,
    description: msg`Labels and text in other languages`,
    Icon: IconLanguage,
    columns: [{ label: msg`Keys`, source: 'count' }],
  },
};
