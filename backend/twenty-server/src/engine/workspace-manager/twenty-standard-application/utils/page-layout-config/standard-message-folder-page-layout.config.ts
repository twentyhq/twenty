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

const MESSAGE_FOLDER_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab13-4013-8013-a5efd1131301',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac13-4013-8013-a5efd1131311',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab13-4013-8013-a5efd1131302',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac13-4013-8013-a5efd1131321',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_MESSAGE_FOLDER_PAGE_LAYOUT_CONFIG = {
  name: 'Default Message Folder Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.messageFolder.universalIdentifier,
  universalIdentifier: '20202020-a113-4013-8013-a5efd1130001',
  defaultTabUniversalIdentifier: null,
  tabs: MESSAGE_FOLDER_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
