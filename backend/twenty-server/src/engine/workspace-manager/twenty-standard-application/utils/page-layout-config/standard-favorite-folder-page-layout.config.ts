import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  TAB_PROPS,
  WIDGET_PROPS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import {
  type StandardPageLayoutConfig,
  type StandardPageLayoutTabConfig,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';

const FAVORITE_FOLDER_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab0f-400f-800f-fa0efd0f0f01',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac0f-400f-800f-fa0efd0f0f11',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab0f-400f-800f-fa0efd0f0f02',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac0f-400f-800f-fa0efd0f0f21',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_FAVORITE_FOLDER_PAGE_LAYOUT_CONFIG = {
  name: 'Default Favorite Folder Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier:
    STANDARD_OBJECTS.favoriteFolder.universalIdentifier,
  universalIdentifier: '20202020-a10f-400f-800f-fa0efd0f0001',
  defaultTabUniversalIdentifier: null,
  tabs: FAVORITE_FOLDER_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
