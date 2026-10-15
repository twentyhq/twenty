import { type Store } from 'jotai/vanilla/store';

import { sseEventStreamIdState } from '@/sse-db-event/states/sseEventStreamIdState';

export const isCurrentEventStream = ({
  store,
  eventStreamId,
}: {
  store: Store;
  eventStreamId: string;
}) => store.get(sseEventStreamIdState.atom) === eventStreamId;
