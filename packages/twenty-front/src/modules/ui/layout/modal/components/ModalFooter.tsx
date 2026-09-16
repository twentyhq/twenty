import { styled } from '@linaria/react';

import { type ModalFooterProps } from '@/ui/layout/modal/types/ModalFooterProps';

const StyledModalFooter = styled.div`
  && {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: var(--t-spacing-2);
    height: 60px;
    justify-content: flex-end;
    overflow: hidden;
    padding: var(--t-spacing-5);
  }

  &[data-auto-height='true'] {
    height: auto;
  }

  &[data-centered='true'] {
    justify-content: center;
  }

  &[data-small-padding='true'] {
    padding: var(--t-spacing-3);
  }
`;

export const ModalFooter = ({
  children,
  autoHeight,
  centered,
  smallPadding,
  className,
}: ModalFooterProps) => (
  <StyledModalFooter
    data-auto-height={autoHeight}
    data-centered={centered}
    data-small-padding={smallPadding}
    className={className}
  >
    {children}
  </StyledModalFooter>
);
