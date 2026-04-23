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

const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab11-4011-8011-a5c4a5111101',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac11-4011-8011-a5c4a5111111',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab11-4011-8011-a5c4a5111102',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac11-4011-8011-a5c4a5111121',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_PAGE_LAYOUT_CONFIG = {
  name: 'Default Message Channel Message Association Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier:
    STANDARD_OBJECTS.messageChannelMessageAssociation.universalIdentifier,
  universalIdentifier: '20202020-a111-4011-8011-a5c4a5110001',
  defaultTabUniversalIdentifier: null,
  tabs: MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
