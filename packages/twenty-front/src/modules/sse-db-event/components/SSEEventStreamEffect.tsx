import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useTriggerEventStreamCreation } from '@/sse-db-event/hooks/useTriggerEventStreamCreation';
import { useTriggerEventStreamDestroy } from '@/sse-db-event/hooks/useTriggerEventStreamDestroy';
import { isCreatingSseEventStreamState } from '@/sse-db-event/states/isCreatingSseEventStreamState';
import { isDestroyingEventStreamState } from '@/sse-db-event/states/isDestroyingEventStreamState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isNonEmptyArray } from '@apollo/client/utilities';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey, OnboardingStatus } from '~/generated-metadata/graphql';

export const SSEEventStreamEffect = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const sseEventStreamId = useRecoilValue(sseEventStreamIdState);
  const isCreatingSseEventStream = useRecoilValue(
    isCreatingSseEventStreamState,
  );
  const shouldDestroyEventStream = useRecoilValue(
    shouldDestroyEventStreamState,
  );
  const isDestroyingEventStream = useRecoilValue(isDestroyingEventStreamState);

  const isLoggedIn = useIsLogged();
  const isSseDbEventsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_SSE_DB_EVENTS_ENABLED,
  );
  const currentUser = useRecoilValue(currentUserState);

  const { triggerEventStreamCreation } = useTriggerEventStreamCreation();
  const { triggerEventStreamDestroy } = useTriggerEventStreamDestroy();

  useEffect(() => {
    const isSseClientAvailable =
      !isCreatingSseEventStream && !isDestroyingEventStream;

    const willCreateEventStream =
      isSseClientAvailable &&
      isLoggedIn &&
      isSseDbEventsEnabled &&
      isDefined(currentUser) &&
      currentUser.onboardingStatus === OnboardingStatus.COMPLETED &&
      !shouldDestroyEventStream &&
      !isNonEmptyString(sseEventStreamId) &&
      isNonEmptyArray(objectMetadataItems);

    const willDestroyEventStream =
      isSseClientAvailable &&
      isNonEmptyString(sseEventStreamId) &&
      shouldDestroyEventStream;

    if (willDestroyEventStream) {
      triggerEventStreamDestroy();
    } else if (willCreateEventStream) {
      triggerEventStreamCreation();
    }
  }, [
    isCreatingSseEventStream,
    triggerEventStreamCreation,
    isLoggedIn,
    currentUser,
    isSseDbEventsEnabled,
    isDestroyingEventStream,
    triggerEventStreamDestroy,
    shouldDestroyEventStream,
    sseEventStreamId,
    objectMetadataItems,
  ]);

  return null;
};
