import { pendingOnDemandFieldRequestsState } from '@/object-record/record-field/on-demand/states/pendingOnDemandFieldRequestsState';
import { type OnDemandFieldLoadResult } from '@/object-record/record-field/on-demand/types/OnDemandFieldLoadResult';
import { type Store } from 'jotai/vanilla/store';
import { removePropertiesFromRecord } from 'twenty-shared/utils';

export const runOnDemandFieldRequest = ({
  store,
  requestKey,
  requestOwner,
  loadValue,
}: {
  store: Store;
  requestKey: string;
  requestOwner: object;
  loadValue: () => Promise<OnDemandFieldLoadResult>;
}): Promise<OnDemandFieldLoadResult> => {
  const pendingRequestsAtom = pendingOnDemandFieldRequestsState.atom;
  const existingRequest = store.get(pendingRequestsAtom)[requestKey];

  if (existingRequest?.requestOwner === requestOwner) {
    return existingRequest.promise;
  }

  const promise = Promise.resolve()
    .then(loadValue)
    .finally(() => {
      const currentRequests = store.get(pendingRequestsAtom);

      if (currentRequests[requestKey]?.promise !== promise) {
        return;
      }

      store.set(
        pendingRequestsAtom,
        removePropertiesFromRecord(currentRequests, [requestKey]),
      );
    });

  store.set(pendingRequestsAtom, (currentRequests) => ({
    ...currentRequests,
    [requestKey]: { requestOwner, promise },
  }));

  return promise;
};
