import { msg } from '@lingui/core/macro';

import { type ApplicationContentSection } from '@/settings/applications/types/ApplicationContentSection';

export const APPLICATION_CONTENT_SECTIONS: ApplicationContentSection[] = [
  {
    title: msg`Data`,
    description: msg`Objects, fields and indexes that shape your records.`,
    color: 'blue',
    contentTypes: ['objects', 'fields', 'indexes'],
  },
  {
    title: msg`Interface`,
    description: msg`How records are shown and navigated.`,
    color: 'purple',
    contentTypes: [
      'views',
      'viewFields',
      'pageLayouts',
      'pageLayoutTabs',
      'navigationMenuItems',
      'commandMenuItems',
      'frontComponents',
    ],
  },
  {
    title: msg`Automation and AI`,
    description: msg`Workflows, functions and agents that act for your team.`,
    color: 'orange',
    contentTypes: ['workflows', 'logicFunctions', 'agents', 'skills'],
  },
  {
    title: msg`Access`,
    description: msg`Who can see and do what.`,
    color: 'red',
    contentTypes: ['roles', 'permissionFlags', 'connectionProviders'],
  },
  {
    title: msg`Packaging`,
    description: msg`Files and translations that ship with it.`,
    color: 'green',
    contentTypes: ['publicAssets', 'translations'],
  },
];
