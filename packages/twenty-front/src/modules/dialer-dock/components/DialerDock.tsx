import styled from '@emotion/styled';
import { useEffect, useRef, useState } from 'react';

// Resolved once at module load, same dual mechanism as REACT_APP_SERVER_BASE_URL
// (src/config/index.ts): window._env_ for the Docker runtime injection,
// import.meta.env for vite dev. Absent flag => component renders nothing.
const DIALER_DOCK_URL: string | undefined =
  window._env_?.REACT_APP_DIALER_DOCK_URL ||
  import.meta.env.REACT_APP_DIALER_DOCK_URL ||
  undefined;

const DIALER_DOCK_EXPANDED_STORAGE_KEY = 'propel-dialer-dock-expanded';

// Inside RootStackingContextZIndices terms: above SidePanel (21), below
// RootModalBackDrop (39) so modals and dialogs still cover the dock.
const DIALER_DOCK_Z_INDEX = 30;

// The dock lives OUTSIDE the router AND outside BaseThemeProvider (which is
// mounted inside the router tree), so it must not read the emotion theme.
// Styling is intentionally self-contained and theme-neutral.
const StyledDockContainer = styled.div`
  bottom: 12px;
  display: flex;
  flex-direction: column;
  position: fixed;
  right: 12px;
  z-index: ${DIALER_DOCK_Z_INDEX};
`;

const StyledPanel = styled.div<{ isExpanded: boolean }>`
  background: #17171c;
  border: 1px solid #2a2a31;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  height: ${({ isExpanded }) => (isExpanded ? '560px' : '0')};
  margin-bottom: ${({ isExpanded }) => (isExpanded ? '8px' : '0')};
  overflow: hidden;
  visibility: ${({ isExpanded }) => (isExpanded ? 'visible' : 'hidden')};
  width: ${({ isExpanded }) => (isExpanded ? '360px' : '0')};
`;

const StyledPanelHeader = styled.div`
  align-items: center;
  background: #101014;
  border-bottom: 1px solid #2a2a31;
  color: #9a9aa2;
  display: flex;
  flex-shrink: 0;
  font:
    600 11px/1 ui-sans-serif,
    system-ui,
    sans-serif;
  justify-content: space-between;
  letter-spacing: 0.06em;
  padding: 8px 10px;
  text-transform: uppercase;
`;

const StyledCollapseButton = styled.button`
  background: transparent;
  border: 0;
  color: #9a9aa2;
  cursor: pointer;
  font: inherit;
  padding: 2px 4px;

  &:hover {
    color: #f2f2f7;
  }
`;

// The iframe is mounted exactly once and never conditionally rendered —
// expand/collapse only changes container CSS. Remounting it would drop the
// softphone's SIP registration and any active call.
const StyledIframe = styled.iframe`
  border: 0;
  flex: 1;
  width: 100%;
`;

const StyledPill = styled.button`
  align-items: center;
  align-self: flex-end;
  background: #2a5cab;
  border: 0;
  border-radius: 999px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  color: #fff;
  cursor: pointer;
  display: flex;
  font:
    600 13px/1 ui-sans-serif,
    system-ui,
    sans-serif;
  gap: 6px;
  padding: 10px 16px;

  &:hover {
    background: #3a6cbb;
  }
`;

type DialerDockMessage = {
  type: 'propel:dial';
  number: string;
};

const isDialerDockMessage = (data: unknown): data is DialerDockMessage =>
  typeof data === 'object' &&
  data !== null &&
  (data as { type?: unknown }).type === 'propel:dial' &&
  typeof (data as { number?: unknown }).number === 'string';

export const DialerDock = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isExpanded, setIsExpanded] = useState(
    () => localStorage.getItem(DIALER_DOCK_EXPANDED_STORAGE_KEY) === 'true',
  );

  const toggleExpanded = () => {
    setIsExpanded((previousIsExpanded) => {
      localStorage.setItem(
        DIALER_DOCK_EXPANDED_STORAGE_KEY,
        String(!previousIsExpanded),
      );
      return !previousIsExpanded;
    });
  };

  // Click-to-call bridge: CRM code anywhere can
  //   window.postMessage({ type: 'propel:dial', number: '+9715...' }, window.location.origin)
  // and the dock forwards { type: 'dial', number } into the softphone iframe.
  useEffect(() => {
    if (!DIALER_DOCK_URL) {
      return;
    }
    const dockOrigin = new URL(DIALER_DOCK_URL, window.location.href).origin;
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }
      if (!isDialerDockMessage(event.data)) {
        return;
      }
      setIsExpanded(true);
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'dial', number: event.data.number },
        dockOrigin,
      );
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  if (!DIALER_DOCK_URL) {
    return null;
  }

  return (
    <StyledDockContainer data-testid="dialer-dock">
      <StyledPanel isExpanded={isExpanded}>
        <StyledPanelHeader>
          Dialer
          <StyledCollapseButton
            aria-label="Collapse dialer"
            onClick={toggleExpanded}
          >
            —
          </StyledCollapseButton>
        </StyledPanelHeader>
        <StyledIframe
          allow="microphone; autoplay"
          ref={iframeRef}
          src={DIALER_DOCK_URL}
          title="Dialer"
        />
      </StyledPanel>
      {!isExpanded && (
        <StyledPill aria-label="Expand dialer" onClick={toggleExpanded}>
          ☎ Dialer
        </StyledPill>
      )}
    </StyledDockContainer>
  );
};
