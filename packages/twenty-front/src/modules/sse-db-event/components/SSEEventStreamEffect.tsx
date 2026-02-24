import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useTriggerEventStreamCreation } from '@/sse-db-event/hooks/useTriggerEventStreamCreation';
import { useTriggerEventStreamDestroy } from '@/sse-db-event/hooks/useTriggerEventStreamDestroy';
import { isCreatingSseEventStreamState } from '@/sse-db-event/states/isCreatingSseEventStreamState';
import { isDestroyingEventStreamState } from '@/sse-db-event/states/isDestroyingEventStreamState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { isNonEmptyArray } from '@apollo/client/utilities';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { OnboardingStatus } from '~/generated-metadata/graphql';

export const SSEEventStreamEffect = () => {
  const objectMetadataItems = useRecoilValueV2(objectMetadataItemsState);

  const sseEventStreamId = useRecoilValueV2(sseEventStreamIdState);
  const isCreatingSseEventStream = useRecoilValueV2(
    isCreatingSseEventStreamState,
  );
  const shouldDestroyEventStream = useRecoilValueV2(
    shouldDestroyEventStreamState,
  );
  const isDestroyingEventStream = useRecoilValueV2(
    isDestroyingEventStreamState,
  );

  const isLoggedIn = useIsLogged();
  const currentUser = useRecoilValueV2(currentUserState);

  const { triggerEventStreamCreation } = useTriggerEventStreamCreation();
  const { triggerEventStreamDestroy } = useTriggerEventStreamDestroy();

  useEffect(() => {
    const isSseClientAvailable =
      !isCreatingSseEventStream && !isDestroyingEventStream;

    const willCreateEventStream =
      isSseClientAvailable &&
      isLoggedIn &&
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
    isDestroyingEventStream,
    triggerEventStreamDestroy,
    shouldDestroyEventStream,
    sseEventStreamId,
    objectMetadataItems,
  ]);

  return null;
};
