import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

const StyledRoot = styled.div<{ width?: number }>`
  align-items: center;
  animation: emptyStateFadeIn calc(var(--t-animation-duration-fast) * 1s) ease;
  display: flex;
  flex-direction: column;
  gap: var(--t-spacing-6);
  height: 100%;
  justify-content: center;
  text-align: center;
  width: ${({ width }) => (isDefined(width) ? `${width}px` : '100%')};

  @keyframes emptyStateFadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: var(--t-spacing-2);
  justify-content: center;
  text-align: center;
  width: 100%;
`;

const StyledTitle = styled.div`
  color: var(--t-font-color-primary);
  font-size: var(--t-font-size-lg);
  font-weight: var(--t-font-weight-semi-bold);
`;

const StyledDescription = styled.div`
  color: var(--t-font-color-tertiary);
  font-size: var(--t-font-size-sm);
  font-weight: var(--t-font-weight-regular);
  line-height: var(--t-text-line-height-lg);
  max-height: 2.8em;
  overflow: hidden;
  width: 50%;
`;

export const EmptyState = {
  Root: StyledRoot,
  Content: StyledContent,
  Title: StyledTitle,
  Description: StyledDescription,
};
