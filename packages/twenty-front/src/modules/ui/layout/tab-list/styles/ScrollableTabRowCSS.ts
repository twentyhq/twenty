// The breakpoint is width-based, so a narrow desktop window matches it too. A
// mouse there has no swipe to fall back on, so only coarse pointers lose the
// scrollbar.
export const SCROLLABLE_TAB_ROW_CSS = `
  overflow-y: hidden;

  @media (pointer: coarse) {
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;
