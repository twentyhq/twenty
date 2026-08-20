import { styled } from '@linaria/react';

// Inline and block insets belong to the card, not to the body: see WidgetCardContent.
export const StyledWidgetContentContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: var(--widget-height, 100%);
  min-height: 0;
  width: 100%;
`;

// The layout decides whether this is a bounded scroll surface or natural page
// content. Pagination sentinels stay inside it in either mode.
export const StyledWidgetScrollContainer = styled(StyledWidgetContentContainer)`
  flex: 1;
  overflow: var(--widget-scroll-overflow, auto);
`;
