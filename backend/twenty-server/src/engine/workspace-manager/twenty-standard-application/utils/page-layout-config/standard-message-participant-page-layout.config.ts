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

const MESSAGE_PARTICIPANT_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab14-4014-8014-a5ea10141401',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac14-4014-8014-a5ea10141411',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab14-4014-8014-a5ea10141402',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac14-4014-8014-a5ea10141421',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_MESSAGE_PARTICIPANT_PAGE_LAYOUT_CONFIG = {
  name: 'Default Message Participant Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier:
    STANDARD_OBJECTS.messageParticipant.universalIdentifier,
  universalIdentifier: '20202020-a114-4014-8014-a5ea10140001',
  defaultTabUniversalIdentifier: null,
  tabs: MESSAGE_PARTICIPANT_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
