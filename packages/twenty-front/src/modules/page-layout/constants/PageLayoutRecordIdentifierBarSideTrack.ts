import { doNotTranslate } from 'twenty-shared/i18n';

import { PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH } from '@/page-layout/constants/PageLayoutLeftPanelContainerWidth';

export const PAGE_LAYOUT_RECORD_IDENTIFIER_BAR_SIDE_TRACK = doNotTranslate(
  `min(${PAGE_LAYOUT_LEFT_PANEL_CONTAINER_WIDTH}px, calc(100% / 3))`,
);
