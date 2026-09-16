import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';

import { type ModalHeaderProps } from '@/ui/layout/modal/types/ModalHeaderProps';

const StyledModalHeader = styled.div`
  && {
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-shrink: 0;
    height: 60px;
    overflow: hidden;
    padding: var(--t-spacing-5);
  }

  &[data-auto-height='true'] {
    height: auto;
  }

  &[data-no-padding='true'] {
    padding: 0;
  }

  &[data-with-horizontal-padding='true'] {
    padding: 0 var(--modal-header-padding-horizontal);

    @media (max-width: 768px) {
      padding-left: var(--t-spacing-4);
      padding-right: var(--t-spacing-4);
    }
  }

  &[data-with-border-bottom='true'] {
    border-bottom: 1px solid var(--t-border-color-medium);
  }
`;

export const ModalHeader = ({
  children,
  noPadding,
  autoHeight,
  hasBorderBottom,
  paddingHorizontal,
  backgroundColor,
}: ModalHeaderProps) => (
  <StyledModalHeader
    data-auto-height={autoHeight}
    data-no-padding={noPadding}
    data-with-border-bottom={hasBorderBottom}
    data-with-horizontal-padding={isDefined(paddingHorizontal)}
    style={
      {
        '--modal-header-padding-horizontal': isDefined(paddingHorizontal)
          ? `var(--t-spacing-${paddingHorizontal})`
          : undefined,
        backgroundColor,
      } as React.CSSProperties
    }
  >
    {children}
  </StyledModalHeader>
);
