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

const MESSAGE_CHANNEL_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab10-4010-8010-a5c4a1101001',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac10-4010-8010-a5c4a1101011',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab10-4010-8010-a5c4a1101002',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac10-4010-8010-a5c4a1101021',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_MESSAGE_CHANNEL_PAGE_LAYOUT_CONFIG = {
  name: 'Default Message Channel Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier:
    STANDARD_OBJECTS.messageChannel.universalIdentifier,
  universalIdentifier: '20202020-a110-4010-8010-a5c4a1100001',
  defaultTabUniversalIdentifier: null,
  tabs: MESSAGE_CHANNEL_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
