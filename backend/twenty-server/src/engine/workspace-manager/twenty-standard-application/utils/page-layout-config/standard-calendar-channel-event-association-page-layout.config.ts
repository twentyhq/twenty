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

const CALENDAR_CHANNEL_EVENT_ASSOCIATION_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab0b-400b-800b-ca1c4e0b0b01',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac0b-400b-800b-ca1c4e0b0b11',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab0b-400b-800b-ca1c4e0b0b02',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac0b-400b-800b-ca1c4e0b0b21',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_CALENDAR_CHANNEL_EVENT_ASSOCIATION_PAGE_LAYOUT_CONFIG = {
  name: 'Default Calendar Channel Event Association Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier:
    STANDARD_OBJECTS.calendarChannelEventAssociation.universalIdentifier,
  universalIdentifier: '20202020-a10b-400b-800b-ca1c4e0b0001',
  defaultTabUniversalIdentifier: null,
  tabs: CALENDAR_CHANNEL_EVENT_ASSOCIATION_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
