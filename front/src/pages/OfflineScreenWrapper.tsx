import { ReactNode, useEffect, useState } from 'react';
import styled from '@emotion/styled';

interface IOfflineScreenWrapper {
  children: ReactNode;
}

export function OfflineScreenWrapper(
  props: IOfflineScreenWrapper,
): JSX.Element {
  const { onLine } = navigator;
  const [isOffline, setIsOffline] = useState(!onLine);

  const StyledOfflineScreenContainer = styled.div`
    background-color: transparent;
    color: var(--text-primary, #333);
    display: flex;
    flex-direction: column;

    height: 100vh;

    justify-content: center;
    text-align: center;
  `;

  const StyledOfflineScreenHeader = styled.h3`
    font-family: Inter;
    font-size: 56px;
    font-style: normal;
    font-weight: 600;
    line-height: 120%;
  `;

  const StyledOfflineScreenContainerBackground = styled.div`
  position: absolute;
  width: 100%
  heigth: 100%
  top: 0;
  left: 0;
  opacity: 0;
  background-color: red;
`;

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(true);
    };

    const handleOffline = () => {
      setIsOffline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    console.log('offline screen render');
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onLine]);

  return (
    <div>
      {isOffline ? (
        <StyledOfflineScreenContainer>
          <StyledOfflineScreenContainerBackground />
          <StyledOfflineScreenHeader>You are offline</StyledOfflineScreenHeader>
        </StyledOfflineScreenContainer>
      ) : (
        props.children
      )}
    </div>
  );
}
