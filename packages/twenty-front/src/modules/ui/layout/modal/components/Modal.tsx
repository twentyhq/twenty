import { styled } from '@linaria/react';
import { type CSSProperties } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dialog } from 'twenty-ui/primitives/surfaces';

import { ModalBackdrop } from '@/ui/layout/modal/components/ModalBackdrop';
import { type ModalProps } from '@/ui/layout/modal/types/ModalProps';

const KEYDOWN_EVENTS_TO_PROPAGATE = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
]);

const DEFAULT_MODAL_Z_INDEX = 40;
const DEFAULT_BACKDROP_Z_INDEX = 39;

const StyledModal = styled.div`
  && {
    background: var(--t-background-primary);
    block-size: auto;
    border-radius: var(--t-border-radius-md);
    box-shadow: var(--t-box-shadow-strong);
    box-sizing: border-box;
    color: var(--t-font-color-primary);
    display: flex;
    flex-direction: column;
    flex-shrink: 1;
    inline-size: auto;
    max-block-size: calc(90dvh / var(--t-zoom, 1));
    max-inline-size: none;
    overflow-x: hidden;
    overflow-y: auto;
    transition: opacity calc(var(--t-animation-duration-normal) * 1s) ease-out;
    z-index: var(--modal-z-index, 40);

    &[data-starting-style],
    &[data-ending-style] {
      opacity: 0;
    }
  }

  &&[data-small='true'] {
    inline-size: var(--t-modal-size-sm-width);
  }

  &&[data-medium='true'] {
    inline-size: var(--t-modal-size-md-width);
  }

  &&[data-large='true'] {
    inline-size: var(--t-modal-size-lg-width);
  }

  &&[data-extra-large='true'] {
    block-size: var(--t-modal-size-xl-height);
    inline-size: var(--t-modal-size-xl-width);
  }

  &&[data-padding-none='true'] {
    padding: var(--t-spacing-0);
  }

  &&[data-padding-small='true'] {
    padding: var(--t-spacing-2);
  }

  &&[data-padding-medium='true'] {
    padding: var(--t-spacing-4);
  }

  &&[data-padding-large='true'] {
    padding: var(--t-spacing-6);
  }

  &&[data-overlay-dark='true'] {
    box-shadow: var(--t-box-shadow-super-heavy);
  }

  &&[data-small-border-radius='true'] {
    border-radius: var(--t-spacing-1);
  }

  &&[data-overlay-transparent='true'] {
    background: transparent;
    border-radius: 0;
    box-shadow: none;
  }

  &&[data-mobile='true'] {
    block-size: var(--t-modal-size-fullscreen-height);
    border-radius: 0;
    inline-size: var(--t-modal-size-fullscreen-width);
    max-block-size: none;
  }

  &&[data-narrow-width='true'] {
    inline-size: calc(400px - var(--t-spacing-32));
  }

  &&[data-auto-height='true'] {
    block-size: auto;
  }

  &&[data-fullscreen='true'] {
    background: var(--t-background-primary);
    block-size: var(--t-modal-size-fullscreen-height);
    border-radius: 0;
    box-shadow: none;
    inline-size: var(--t-modal-size-fullscreen-width);
    max-block-size: none;
  }
`;

export const Modal = ({
  isOpen,
  ariaLabel,
  children,
  size = 'medium',
  padding = 'medium',
  overlay = 'dark',
  isMobile = false,
  isInContainer = false,
  container,
  gap,
  smallBorderRadius,
  narrowWidth,
  autoHeight,
  width,
  modalZIndex = DEFAULT_MODAL_Z_INDEX,
  backdropZIndex = DEFAULT_BACKDROP_Z_INDEX,
  backdropTestId = 'modal-backdrop',
  backdropClickOutsideId,
  preventClickOutside,
  onBackdropMouseDown,
  modalRef,
}: ModalProps) => (
  <Dialog.Root open={isOpen} modal={false} disablePointerDismissal>
    <Dialog.Popup
      container={container ?? undefined}
      backdrop={false}
      initialFocus={false}
      finalFocus={false}
      ref={modalRef}
      aria-label={ariaLabel}
      onKeyDown={(event) => {
        if (KEYDOWN_EVENTS_TO_PROPAGATE.has(event.key)) {
          event.preventBaseUIHandler();
        }
      }}
      viewportProps={{
        style: { pointerEvents: 'auto' },
        render: (
          <ModalBackdrop
            data-testid={backdropTestId}
            data-click-outside-id={backdropClickOutsideId}
            overlay={overlay}
            backdropZIndex={backdropZIndex}
            isInContainer={isInContainer}
            onMouseDown={(event) => {
              event.stopPropagation();
              onBackdropMouseDown?.(event);
            }}
          />
        ),
      }}
      render={
        <StyledModal
          data-small={size === 'small'}
          data-medium={size === 'medium'}
          data-large={size === 'large'}
          data-extra-large={size === 'extraLarge'}
          data-fullscreen={size === 'fullscreen'}
          data-padding-none={padding === 'none'}
          data-padding-small={padding === 'small'}
          data-padding-medium={padding === 'medium'}
          data-padding-large={padding === 'large'}
          data-overlay-dark={overlay === 'dark'}
          data-overlay-transparent={overlay === 'transparent'}
          data-mobile={isMobile}
          data-small-border-radius={smallBorderRadius}
          data-narrow-width={narrowWidth}
          data-auto-height={autoHeight}
          data-globally-prevent-click-outside={preventClickOutside}
          style={
            {
              '--modal-z-index': modalZIndex,
              width: isMobile ? undefined : width,
              gap: isDefined(gap) ? `var(--t-spacing-${gap})` : undefined,
            } as CSSProperties
          }
        />
      }
    >
      {children}
    </Dialog.Popup>
  </Dialog.Root>
);
