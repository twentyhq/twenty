import { useQuery } from '@apollo/client';
import { RemoteReceiver } from '@remote-dom/core/receivers';
import { RemoteRootRenderer } from '@remote-dom/react/host';
import { useEffect, useMemo, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { PageLayoutWidgetNoDataDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetNoDataDisplay';
import { GET_FRONT_COMPONENT_CODE } from '@/page-layout/widgets/front-component/graphql/queries/getFrontComponentCode';
import { ChartSkeletonLoader } from '@/page-layout/widgets/graph/components/ChartSkeletonLoader';
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

type FrontComponentWidgetRendererProps = {
  widget: PageLayoutWidget;
};

export const FrontComponentWidgetRenderer = ({
  widget,
}: FrontComponentWidgetRendererProps) => {
  const configuration = widget.configuration;

  if (!isDefined(configuration) || !('frontComponentId' in configuration)) {
    return <PageLayoutWidgetNoDataDisplay />;
  }

  const frontComponentId = configuration.frontComponentId;

  return <FrontComponentContent frontComponentId={frontComponentId} />;
};

type FrontComponentContentProps = {
  frontComponentId: string;
};

const FrontComponentContent = ({
  frontComponentId,
}: FrontComponentContentProps) => {
  const [hasError, setHasError] = useState(false);
  // eslint-disable-next-line
  const workerRef = useRef<Worker | null>(null);

  const receiver = useMemo(() => new RemoteReceiver(), []);

  const { data, loading, error } = useQuery(GET_FRONT_COMPONENT_CODE, {
    variables: { id: frontComponentId },
  });

  useEffect(() => {
    const sourceCode = data?.getFrontComponentCode?.sourceCode;

    if (!isDefined(sourceCode)) {
      return;
    }

    try {
      // Create a blob from the source code to run in a Web Worker
      const blob = new Blob([sourceCode], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      const worker = new Worker(blobUrl, { type: 'module' });

      workerRef.current = worker;

      // Set up communication between Worker and RemoteReceiver using MessageChannel
      const { port1, port2 } = new MessageChannel();

      port1.onmessage = (event) => {
        const message = event.data;

        if (message.type === 'mutate') {
          receiver.connection.mutate(message.records);
        } else if (message.type === 'call') {
          receiver.connection.call(message.id, message.method, ...message.args);
        }
      };
      port1.start();

      worker.postMessage({ type: 'connect', port: port2 }, [port2]);

      worker.onerror = () => {
        setHasError(true);
      };

      return () => {
        worker.terminate();
        URL.revokeObjectURL(blobUrl);
        workerRef.current = null;
      };
    } catch {
      setHasError(true);
    }
  }, [data, receiver]);

  if (loading) {
    return (
      <StyledContainer>
        <StyledLoadingContainer>
          <ChartSkeletonLoader />
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
        <RemoteRootRenderer receiver={receiver} components={new Map()} />
      </StyledRemoteContainer>
    </StyledContainer>
  );
};
