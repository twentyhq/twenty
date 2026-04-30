import { ADD_QUERY_TO_EVENT_STREAM_MUTATION } from '@/sse-db-event/graphql/mutations/AddQueryToEventStreamMutation';
import { REMOVE_QUERY_FROM_EVENT_STREAM_MUTATION } from '@/sse-db-event/graphql/mutations/RemoveQueryFromEventStreamMutation';
import { activeQueryListenersState } from '@/sse-db-event/states/activeQueryListenersState';
import { requiredQueryListenersState } from '@/sse-db-event/states/requiredQueryListenersState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { sseEventStreamReadyState } from '@/sse-db-event/states/sseEventStreamReadyState';
import { isGracefullyHandledEventStreamError } from '@/sse-db-event/utils/isGracefullyHandledEventStreamError';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import {
  compareArraysOfObjectsByProperty,
  isDefined,
} from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import {
  type AddQuerySubscriptionInput,
  type RemoveQueryFromEventStreamInput,
} from '~/generated-metadata/graphql';
import { getGraphqlErrorExtensionsFromError } from '~/utils/get-graphql-error-extensions-from-error.util';

export const SSEQuerySubscribeEffect = () => {
  const store = useStore();
  const sseEventStreamId = useAtomStateValue(sseEventStreamIdState);
  const sseEventStreamReady = useAtomStateValue(sseEventStreamReadyState);

  const [addQueryToEventStream] = useMutation<
    boolean,
    { input: AddQuerySubscriptionInput }
  >(ADD_QUERY_TO_EVENT_STREAM_MUTATION);

  const [removeQueryFromEventStream] = useMutation<
    void,
    { input: RemoveQueryFromEventStreamInput }
  >(REMOVE_QUERY_FROM_EVENT_STREAM_MUTATION);

  const requiredQueryListeners = useAtomStateValue(requiredQueryListenersState);
  const activeQueryListeners = useAtomStateValue(activeQueryListenersState);

  const updateQueryListeners = useCallback(async () => {
    if (!isDefined(sseEventStreamId)) {
      return;
    }

    const requiredQueryListeners = store.get(requiredQueryListenersState.atom);

    const activeQueryListeners = store.get(activeQueryListenersState.atom);

    const queryListenersToAdd = requiredQueryListeners.filter(
      (listener) =>
        !activeQueryListeners.some(
          (activeListener) => activeListener.queryId === listener.queryId,
        ),
    );

    const queryListenersToRemove = activeQueryListeners.filter(
      (listener) =>
        !requiredQueryListeners.some(
          (requiredListener) => requiredListener.queryId === listener.queryId,
        ),
    );

    try {
      for (const queryListenerToAdd of queryListenersToAdd) {
        await addQueryToEventStream({
          variables: {
            input: {
              eventStreamId: sseEventStreamId,
              queryId: queryListenerToAdd.queryId,
              operationSignature: queryListenerToAdd.operationSignature,
            },
          },
        });
      }

      for (const queryListenerToRemove of queryListenersToRemove) {
        await removeQueryFromEventStream({
          variables: {
            input: {
              eventStreamId: sseEventStreamId,
              queryId: queryListenerToRemove.queryId,
            },
          },
        });
      }
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        const extensions = getGraphqlErrorExtensionsFromError(error);

        if (
          isGracefullyHandledEventStreamError({
            subCode: extensions?.subCode,
            code: extensions?.code,
          })
        ) {
          store.set(activeQueryListenersState.atom, []);
          store.set(shouldDestroyEventStreamState.atom, true);
          return;
        }

        throw new Error(`Unhandled error for event stream: ${error.message}`);
      }
    }

    store.set(activeQueryListenersState.atom, requiredQueryListeners);
  }, [
    addQueryToEventStream,
    removeQueryFromEventStream,
    sseEventStreamId,
    store,
  ]);

  const debouncedUpdateQueryListeners = useDebouncedCallback(
    updateQueryListeners,
    1000,
    { leading: true },
  );

  useEffect(() => {
    if (!isNonEmptyString(sseEventStreamId) || !sseEventStreamReady) {
      return;
    }

    const areRequiredQueryListenersDifferentFromActiveQueryListeners =
      compareArraysOfObjectsByProperty(
        requiredQueryListeners,
        activeQueryListeners,
        'queryId',
      );

    if (areRequiredQueryListenersDifferentFromActiveQueryListeners) {
      debouncedUpdateQueryListeners();
    }
  }, [
    sseEventStreamId,
    sseEventStreamReady,
    requiredQueryListeners,
    activeQueryListeners,
    debouncedUpdateQueryListeners,
  ]);

  return null;
};
