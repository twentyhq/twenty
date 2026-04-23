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

const CONNECTED_ACCOUNT_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab0d-400d-800d-c0aec10d0d01',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac0d-400d-800d-c0aec10d0d11',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab0d-400d-800d-c0aec10d0d02',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac0d-400d-800d-c0aec10d0d21',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_CONNECTED_ACCOUNT_PAGE_LAYOUT_CONFIG = {
  name: 'Default Connected Account Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier:
    STANDARD_OBJECTS.connectedAccount.universalIdentifier,
  universalIdentifier: '20202020-a10d-400d-800d-c0aec10d0001',
  defaultTabUniversalIdentifier: null,
  tabs: CONNECTED_ACCOUNT_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
