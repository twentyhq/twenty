import { styled } from '@linaria/react';
import { useRender } from '@base-ui/react/use-render';

import { type ModalBackdropProps } from '@/ui/layout/modal/types/ModalBackdropProps';

const StyledBackdrop = styled.div`
  && {
    align-items: center;
    background: var(--t-background-overlay-primary);
    display: flex;
    block-size: 100%;
    justify-content: center;
    inset: 0;
    inline-size: 100%;
    overflow: visible;
    padding: 0;
    pointer-events: auto;
    position: fixed;
    user-select: none;
  }

  &[data-light='true'] {
    background: var(--t-background-overlay-tertiary);
  }

  &[data-in-container='true'] {
    background: var(--t-background-overlay-tertiary);
    position: absolute;
  }

  &[hidden] {
    display: none;
  }
`;

export const ModalBackdrop = ({
  overlay,
  backdropZIndex,
  isInContainer,
  ref,
  ...props
}: ModalBackdropProps) =>
  useRender({
    render: <StyledBackdrop />,
    ref,
    props: {
      ...props,
      'data-light': overlay === 'light',
      'data-in-container': isInContainer,
      style: { ...props.style, zIndex: backdropZIndex },
    },
  });
