import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/__docusaurus/debug',
    component: ComponentCreator('/__docusaurus/debug', '296'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/config',
    component: ComponentCreator('/__docusaurus/debug/config', 'b7e'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/content',
    component: ComponentCreator('/__docusaurus/debug/content', 'e48'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/globalData',
    component: ComponentCreator('/__docusaurus/debug/globalData', '290'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/metadata',
    component: ComponentCreator('/__docusaurus/debug/metadata', 'c4b'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/registry',
    component: ComponentCreator('/__docusaurus/debug/registry', 'a74'),
    exact: true
  },
  {
    path: '/__docusaurus/debug/routes',
    component: ComponentCreator('/__docusaurus/debug/routes', 'a52'),
    exact: true
  },
  {
    path: '/graphql/core',
    component: ComponentCreator('/graphql/core', '56e'),
    exact: true
  },
  {
    path: '/graphql/metadata',
    component: ComponentCreator('/graphql/metadata', '79a'),
    exact: true
  },
  {
    path: '/rest-api/core',
    component: ComponentCreator('/rest-api/core', 'cbf'),
    exact: true
  },
  {
    path: '/rest-api/metadata',
    component: ComponentCreator('/rest-api/metadata', '1ac'),
    exact: true
  },
  {
    path: '/search',
    component: ComponentCreator('/search', '4e4'),
    exact: true
  },
  {
    path: '/',
    component: ComponentCreator('/', '8a2'),
    routes: [
      {
        path: '/',
        component: ComponentCreator('/', 'd7f'),
        routes: [
          {
            path: '/',
            component: ComponentCreator('/', '397'),
            routes: [
              {
                path: '/contributor/bug-and-requests',
                component: ComponentCreator('/contributor/bug-and-requests', '61a'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/contributor/frontend/',
                component: ComponentCreator('/contributor/frontend/', '94d'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/contributor/frontend/best-practices',
                component: ComponentCreator('/contributor/frontend/best-practices', 'e18'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/contributor/frontend/folder-architecture',
                component: ComponentCreator('/contributor/frontend/folder-architecture', '26d'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/contributor/frontend/hotkeys',
                component: ComponentCreator('/contributor/frontend/hotkeys', 'ecf'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/contributor/frontend/style-guide',
                component: ComponentCreator('/contributor/frontend/style-guide', 'ba9'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/contributor/frontend/work-with-figma',
                component: ComponentCreator('/contributor/frontend/work-with-figma', '47f'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/contributor/server/',
                component: ComponentCreator('/contributor/server/', 'b15'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/contributor/server/best-practices',
                component: ComponentCreator('/contributor/server/best-practices', 'd6b'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/contributor/server/custom-objects',
                component: ComponentCreator('/contributor/server/custom-objects', '48a'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/contributor/server/feature-flags',
                component: ComponentCreator('/contributor/server/feature-flags', '0c6'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/contributor/server/folder-architecture',
                component: ComponentCreator('/contributor/server/folder-architecture', '674'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/contributor/server/queue',
                component: ComponentCreator('/contributor/server/queue', 'ca8'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/contributor/server/zapier',
                component: ComponentCreator('/contributor/server/zapier', '732'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/start/cloud',
                component: ComponentCreator('/start/cloud', '337'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/start/local-setup/',
                component: ComponentCreator('/start/local-setup/', 'db4'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/start/local-setup/ide-setup',
                component: ComponentCreator('/start/local-setup/ide-setup', '050'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/start/local-setup/troubleshooting',
                component: ComponentCreator('/start/local-setup/troubleshooting', '5c5'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/start/local-setup/yarn-setup',
                component: ComponentCreator('/start/local-setup/yarn-setup', '950'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/start/self-hosting/',
                component: ComponentCreator('/start/self-hosting/', 'ef8'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/start/self-hosting/cloud-providers',
                component: ComponentCreator('/start/self-hosting/cloud-providers', '147'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/start/self-hosting/docker-compose',
                component: ComponentCreator('/start/self-hosting/docker-compose', '076'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/start/self-hosting/upgrade-guide',
                component: ComponentCreator('/start/self-hosting/upgrade-guide', 'f8a'),
                exact: true,
                sidebar: "docsSidebar"
              },
              {
                path: '/ui-components/',
                component: ComponentCreator('/ui-components/', 'e91'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/display/app-tooltip',
                component: ComponentCreator('/ui-components/display/app-tooltip', '52d'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/display/checkmark',
                component: ComponentCreator('/ui-components/display/checkmark', '183'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/display/chip',
                component: ComponentCreator('/ui-components/display/chip', 'd20'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/display/icons',
                component: ComponentCreator('/ui-components/display/icons', '79f'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/display/soon-pill',
                component: ComponentCreator('/ui-components/display/soon-pill', 'fe4'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/display/tag',
                component: ComponentCreator('/ui-components/display/tag', 'd7a'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/feedback/progress-bar',
                component: ComponentCreator('/ui-components/feedback/progress-bar', 'cef'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/input/block-editor',
                component: ComponentCreator('/ui-components/input/block-editor', 'd0a'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/input/button',
                component: ComponentCreator('/ui-components/input/button', 'e4c'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/input/checkbox',
                component: ComponentCreator('/ui-components/input/checkbox', '03e'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/input/color-scheme',
                component: ComponentCreator('/ui-components/input/color-scheme', '211'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/input/icon-picker',
                component: ComponentCreator('/ui-components/input/icon-picker', 'f9d'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/input/image-input',
                component: ComponentCreator('/ui-components/input/image-input', 'a0f'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/input/radio',
                component: ComponentCreator('/ui-components/input/radio', 'cbc'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/input/select',
                component: ComponentCreator('/ui-components/input/select', 'cb3'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/input/text',
                component: ComponentCreator('/ui-components/input/text', '914'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/input/toggle',
                component: ComponentCreator('/ui-components/input/toggle', '857'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/navigation/bread-crumb',
                component: ComponentCreator('/ui-components/navigation/bread-crumb', 'f40'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/navigation/link',
                component: ComponentCreator('/ui-components/navigation/link', '420'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/navigation/menu-item',
                component: ComponentCreator('/ui-components/navigation/menu-item', '55a'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/navigation/navigation-bar',
                component: ComponentCreator('/ui-components/navigation/navigation-bar', '95d'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/ui-components/navigation/step-bar',
                component: ComponentCreator('/ui-components/navigation/step-bar', 'd13'),
                exact: true,
                sidebar: "uiDocsSidebar"
              },
              {
                path: '/',
                component: ComponentCreator('/', 'b8a'),
                exact: true,
                sidebar: "docsSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
