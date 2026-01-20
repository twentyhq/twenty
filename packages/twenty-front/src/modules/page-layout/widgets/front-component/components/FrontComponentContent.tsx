import { useQuery } from '@apollo/client';
import { RemoteReceiver } from '@remote-dom/core/receivers';
import {
  createRemoteComponentRenderer,
  RemoteFragmentRenderer,
  RemoteRootRenderer,
} from '@remote-dom/react/host';
import { createElement, useEffect, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { WidgetSkeletonLoader } from '@/page-layout/widgets/components/WidgetSkeletonLoader';
import { GET_FRONT_COMPONENT_CODE } from '@/page-layout/widgets/front-component/graphql/queries/getFrontComponentCode';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.border.radius.md};
  background: ${({ theme }) => theme.background.primary};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledLoadingContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding-top: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.background.primary};
  pointer-events: none;
  z-index: 1;
`;

const StyledErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
`;

const StyledRemoteContainer = styled.div`
  flex: 1;
  height: 100%;
  width: 100%;
  padding: ${({ theme }) => theme.spacing(2)};
`;

type RemoteElementProps = {
  type?: string;
  children?: React.ReactNode;
};

// Renderer for remote-element that maps to the appropriate HTML element
const RemoteElementRenderer = createRemoteComponentRenderer(
  ({ type = 'div', children }: RemoteElementProps) =>
    createElement(type, null, children),
);

// Component map for RemoteRootRenderer to render remote elements as React
const components = new Map([
  ['remote-element', RemoteElementRenderer],
  ['remote-fragment', RemoteFragmentRenderer],
]);

type FrontComponentContentProps = {
  frontComponentId: string;
};

export const FrontComponentContent = ({
  frontComponentId,
}: FrontComponentContentProps) => {
  const [hasError, setHasError] = useState(false);

  const receiver = useMemo(() => new RemoteReceiver(), []);

  const { data, loading, error } = useQuery(GET_FRONT_COMPONENT_CODE, {
    variables: { id: frontComponentId },
  });

  useEffect(() => {
    const sourceCode = data?.getFrontComponentCode?.sourceCode;

    if (!isDefined(sourceCode)) {
      return;
    }

    let worker: Worker | null = null;
    let blobUrl: string | null = null;

    try {
      // Create a blob from the source code to run in a Web Worker
      const blob = new Blob([sourceCode], { type: 'application/javascript' });
      blobUrl = URL.createObjectURL(blob);
      worker = new Worker(blobUrl, { type: 'module' });

      // Set up a MessageChannel for bidirectional communication
      const { port1, port2 } = new MessageChannel();

      // Handle messages from the worker and forward to RemoteReceiver
      port1.onmessage = (event) => {
        const message = event.data;

        if (message.type === 'mutate') {
          receiver.connection.mutate(message.records);
        } else if (message.type === 'call') {
          receiver.connection.call(message.id, message.method, ...message.args);
        }
      };
      port1.start();

      // Send the port to the worker so it can establish a connection
      worker.postMessage({ type: 'connect', port: port2 }, [port2]);

      worker.onerror = () => {
        setHasError(true);
      };
    } catch {
      setHasError(true);
    }

    return () => {
      if (isDefined(worker)) {
        worker.terminate();
      }
      if (isDefined(blobUrl)) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [data, receiver]);

  if (loading) {
    return (
      <StyledContainer>
        <StyledLoadingContainer>
          <WidgetSkeletonLoader />
        </StyledLoadingContainer>
      </StyledContainer>
    );
  }

  if (
    isDefined(error) ||
    hasError ||
    !isDefined(data?.getFrontComponentCode?.sourceCode)
  ) {
    return (
      <StyledContainer>
        <StyledErrorContainer>
          <PageLayoutWidgetNoDataDisplay />
        </StyledErrorContainer>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      <StyledRemoteContainer>
        <RemoteRootRenderer receiver={receiver} components={components} />
      </StyledRemoteContainer>
    </StyledContainer>
  );
};
