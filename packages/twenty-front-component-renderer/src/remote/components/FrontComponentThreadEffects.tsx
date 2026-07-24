import { type GeometryTracker } from '@/host/types/GeometryTracker';
import { FrontComponentConfirmationModalResultEffect } from '@/remote/components/FrontComponentConfirmationModalResultEffect';
import { FrontComponentGeometryTrackerEffect } from '@/remote/components/FrontComponentGeometryTrackerEffect';
import { FrontComponentInitializeHostCommunicationApiEffect } from '@/remote/components/FrontComponentInitializeHostCommunicationApiEffect';
import { FrontComponentUpdateContextEffect } from '@/remote/components/FrontComponentUpdateContextEffect';
import { FrontComponentUpdateHostCommunicationApiEffect } from '@/remote/components/FrontComponentUpdateHostCommunicationApiEffect';
import { type FrontComponentHostCommunicationApi } from '@/types/FrontComponentHostCommunicationApi';
import { type FrontComponentThread } from '@/types/FrontComponentThread';
import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';

type FrontComponentThreadEffectsProps = {
  thread: FrontComponentThread;
  geometryTracker: GeometryTracker;
  executionContext: FrontComponentExecutionContext;
  frontComponentHostCommunicationApi: FrontComponentHostCommunicationApi;
  onExecutionContextInitialized: () => void;
  onError: (error: Error) => void;
};

export const FrontComponentThreadEffects = ({
  thread,
  geometryTracker,
  executionContext,
  frontComponentHostCommunicationApi,
  onExecutionContextInitialized,
  onError,
}: FrontComponentThreadEffectsProps) => (
  <>
    <FrontComponentUpdateHostCommunicationApiEffect
      thread={thread}
      frontComponentHostCommunicationApi={frontComponentHostCommunicationApi}
    />
    <FrontComponentInitializeHostCommunicationApiEffect thread={thread} />
    <FrontComponentGeometryTrackerEffect
      thread={thread}
      geometryTracker={geometryTracker}
    />
    <FrontComponentUpdateContextEffect
      thread={thread}
      executionContext={executionContext}
      onExecutionContextInitialized={onExecutionContextInitialized}
    />
    <FrontComponentConfirmationModalResultEffect
      thread={thread}
      frontComponentId={executionContext.frontComponentId}
      onError={onError}
    />
  </>
);
