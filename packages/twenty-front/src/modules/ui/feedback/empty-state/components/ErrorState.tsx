import { styled } from '@linaria/react';

const StyledRoot = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: var(--t-spacing-8);
  height: 100%;
  justify-content: center;
  text-align: center;
  width: 100%;
`;

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: var(--t-spacing-4);
  justify-content: center;
  text-align: center;
  width: 100%;
`;

const StyledTitle = styled.div`
  color: var(--t-font-color-primary);
  font-size: var(--t-font-size-xl);
  font-weight: var(--t-font-weight-semi-bold);
  line-height: var(--t-text-line-height-lg);
`;

const StyledDescription = styled.div`
  color: var(--t-font-color-tertiary);
  font-size: var(--t-font-size-xs);
  font-weight: var(--t-font-weight-regular);
  line-height: var(--t-text-line-height-md);
  max-height: 2.4em;
  overflow: hidden;
`;

export const ErrorState = {
  Root: StyledRoot,
  Content: StyledContent,
  Title: StyledTitle,
  Description: StyledDescription,
};
