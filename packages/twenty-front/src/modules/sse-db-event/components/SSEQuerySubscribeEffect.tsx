import { ADD_QUERY_TO_EVENT_STREAM_MUTATION } from '@/sse-db-event/graphql/mutations/AddQueryToEventStreamMutation';
import { REMOVE_QUERY_FROM_EVENT_STREAM_MUTATION } from '@/sse-db-event/graphql/mutations/RemoveQueryFromEventStreamMutation';
import { activeQueryListenersState } from '@/sse-db-event/states/activeQueryListenersState';
import { requiredQueryListenersState } from '@/sse-db-event/states/requiredQueryListenersState';
import { shouldDestroyEventStreamState } from '@/sse-db-event/states/shouldDestroyEventStreamState';
import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';
import { sseEventStreamReadyState } from '@/sse-db-event/states/sseEventStreamReadyState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { ApolloError, useMutation } from '@apollo/client';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import {
  compareArraysOfObjectsByProperty,
  isDefined,
} from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';
import {
  type AddQuerySubscriptionInput,
  type RemoveQueryFromEventStreamInput,
} from '~/generated-metadata/graphql';

export const SSEQuerySubscribeEffect = () => {
  const sseEventStreamId = useRecoilValue(sseEventStreamIdState);
  const sseEventStreamReady = useRecoilValue(sseEventStreamReadyState);

  const [addQueryToEventStream] = useMutation<
    boolean,
    { input: AddQuerySubscriptionInput }
  >(ADD_QUERY_TO_EVENT_STREAM_MUTATION);

  const [removeQueryFromEventStream] = useMutation<
    void,
    { input: RemoveQueryFromEventStreamInput }
  >(REMOVE_QUERY_FROM_EVENT_STREAM_MUTATION);

  const requiredQueryListeners = useRecoilValue(requiredQueryListenersState);
  const activeQueryListeners = useRecoilValue(activeQueryListenersState);

  const updateQueryListeners = useRecoilCallback(
    ({ set, snapshot }) =>
      async () => {
        if (!isDefined(sseEventStreamId)) {
          return;
        }

        const requiredQueryListeners = getSnapshotValue(
          snapshot,
          requiredQueryListenersState,
        );

        const activeQueryListeners = getSnapshotValue(
          snapshot,
          activeQueryListenersState,
        );

        const queryListenersToAdd = requiredQueryListeners.filter(
          (listener) =>
            !activeQueryListeners.some(
              (activeListener) => activeListener.queryId === listener.queryId,
            ),
        );

        const queryListenersToRemove = activeQueryListeners.filter(
          (listener) =>
            !requiredQueryListeners.some(
              (requiredListener) =>
                requiredListener.queryId === listener.queryId,
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
          if (error instanceof ApolloError) {
            const subCode = error.graphQLErrors[0]?.extensions?.subCode;

            switch (subCode) {
              case 'EVENT_STREAM_DOES_NOT_EXIST':
              case 'EVENT_STREAM_ALREADY_EXISTS': {
                set(activeQueryListenersState, []);
                set(shouldDestroyEventStreamState, true);
                return;
              }
              default: {
                throw new Error(
                  `Unhandled error for event stream: ${error.message}`,
                );
              }
            }
          }
        }

        set(activeQueryListenersState, requiredQueryListeners);
      },
    [addQueryToEventStream, removeQueryFromEventStream, sseEventStreamId],
  );

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
