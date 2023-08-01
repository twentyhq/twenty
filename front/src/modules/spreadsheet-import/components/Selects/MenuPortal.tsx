import React, { useEffect, useLayoutEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { usePopper } from '@chakra-ui/popper';
import { Box, useTheme } from '@chakra-ui/react';

import { useRsi } from '../../hooks/useRsi';
import { rootId } from '../Providers';

function createWrapperAndAppendToBody(wrapperId: string) {
  const wrapperElement = document.createElement('div');
  wrapperElement.setAttribute('id', wrapperId);
  document.body.appendChild(wrapperElement);
  return wrapperElement;
}

export const SELECT_DROPDOWN_ID = 'react-select-dropdown-wrapper';

interface PortalProps {
  controlElement: HTMLDivElement | null;
  children: React.ReactNode;
}

const MenuPortal = (props: PortalProps) => {
  const theme = useTheme();
  const { rtl } = useRsi();
  const { popperRef, referenceRef } = usePopper({
    strategy: 'fixed',
    matchWidth: true,
  });
  const [wrapperElement, setWrapperElement] = useState<HTMLElement | null>(
    null,
  );

  useLayoutEffect(() => {
    let element = document.getElementById(SELECT_DROPDOWN_ID);
    let systemCreated = false;
    if (!element) {
      systemCreated = true;
      element = createWrapperAndAppendToBody(SELECT_DROPDOWN_ID);
    }
    setWrapperElement(element);

    return () => {
      if (systemCreated && element?.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, []);

  useEffect(() => {
    referenceRef(props.controlElement);
  }, [props.controlElement, referenceRef]);

  // wrapperElement state will be null on very first render.
  if (wrapperElement === null) return null;

  return ReactDOM.createPortal(
    <Box
      dir={rtl ? 'rtl' : 'ltr'}
      ref={popperRef}
      zIndex={theme.zIndices.tooltip}
      sx={{
        '&[data-popper-reference-hidden]': {
          visibility: 'hidden',
          pointerEvents: 'none',
        },
      }}
      id={rootId}
    >
      {props.children}
    </Box>,
    wrapperElement,
  );
};

export const customComponents = {
  MenuPortal,
};
