// The breakpoint is width-based, so only coarse pointers (which can swipe) lose the scrollbar
export const SCROLLABLE_TAB_ROW_CSS = `
  overflow-y: hidden;

  @media (pointer: coarse) {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;
