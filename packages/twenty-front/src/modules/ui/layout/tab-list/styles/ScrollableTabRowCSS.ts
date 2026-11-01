import { doNotTranslate } from 'twenty-shared/i18n';

// A width breakpoint also matches narrow desktop windows, where a mouse cannot swipe, so only coarse pointers lose the scrollbar
export const SCROLLABLE_TAB_ROW_CSS = doNotTranslate(`
  overflow-y: hidden;

  @media (pointer: coarse) {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`);
