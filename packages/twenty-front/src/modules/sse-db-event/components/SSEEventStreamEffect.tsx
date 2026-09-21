import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useTriggerEventStreamCreation } from '@/sse-db-event/hooks/useTriggerEventStreamCreation';
import { useTriggerEventStreamDestroy } from '@/sse-db-event/hooks/useTriggerEventStreamDestroy';
import { isCreatingSseEventStreamState } from '@/sse-db-event/states/isCreatingSseEventStreamState';
import { isDestroyingEventStreamState } from '@/sse-db-event/states/isDestroyingEventStreamState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { OnboardingStatus } from '~/generated-metadata/graphql';

export const SSEEventStreamEffect = () => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const sseEventStreamId = useAtomStateValue(sseEventStreamIdState);
  const isCreatingSseEventStream = useAtomStateValue(
    isCreatingSseEventStreamState,
  );
  const shouldDestroyEventStream = useAtomStateValue(
    shouldDestroyEventStreamState,
  );
  const isDestroyingEventStream = useAtomStateValue(
    isDestroyingEventStreamState,
  );

  const isLogged = useIsLogged();
  const currentUser = useAtomStateValue(currentUserState);

  const { triggerEventStreamCreation } = useTriggerEventStreamCreation();
  const { triggerEventStreamDestroy } = useTriggerEventStreamDestroy();

  useEffect(() => {
    const isSseClientAvailable =
      !isCreatingSseEventStream && !isDestroyingEventStream;

    const willCreateEventStream =
      isSseClientAvailable &&
      isLogged &&
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
    isLogged,
    currentUser,
    isDestroyingEventStream,
    triggerEventStreamDestroy,
    shouldDestroyEventStream,
    sseEventStreamId,
    objectMetadataItems,
  ]);

  return null;
};
