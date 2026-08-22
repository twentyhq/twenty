import { styled } from '@linaria/react';

export const StyledWidgetContentContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: var(--widget-height, 100%);
  min-height: 0;
  width: 100%;
`;

export const StyledWidgetScrollContainer = styled(StyledWidgetContentContainer)`
  flex: 1;
  overflow: var(--widget-scroll-overflow, auto);
`;
