import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { type ModalContentProps } from '@/ui/layout/modal/types/ModalContentProps';

const StyledModalContent = styled.div`
  && {
    align-items: stretch;
    display: flex;
    flex: 1 1 0%;
    flex-direction: column;
    justify-content: flex-start;
    overflow: visible;
    padding: var(--t-spacing-10);
  }

  &[data-vertically-centered='true'] {
    align-items: center;
  }

  &[data-horizontally-centered='true'] {
    justify-content: center;
  }

  &[data-overflow-hidden='true'] {
    overflow: hidden;
  }

  &[data-with-content-padding='true'] {
    padding: var(--modal-content-padding);
  }

  &[data-no-padding='true'] {
    padding: 0;
  }
`;

export const ModalContent = ({
  children,
  isVerticallyCentered,
  isHorizontallyCentered,
  noPadding,
  overflowHidden,
  gap,
  contentPadding,
}: ModalContentProps) => (
  <StyledModalContent
    data-vertically-centered={isVerticallyCentered}
    data-horizontally-centered={isHorizontallyCentered}
    data-overflow-hidden={overflowHidden}
    data-with-content-padding={isDefined(contentPadding)}
    data-no-padding={noPadding}
    style={
      {
        gap: isDefined(gap) ? `var(--t-spacing-${gap})` : undefined,
        '--modal-content-padding': isDefined(contentPadding)
          ? `var(--t-spacing-${contentPadding})`
          : undefined,
      } as React.CSSProperties
    }
  >
    {children}
  </StyledModalContent>
);
