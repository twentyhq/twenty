import { isDefined } from 'twenty-shared/utils';

import { type MutationObserverRegistration } from '@/polyfills/dom/types/MutationObserverRegistration';
import { type MutationObserverRegistry } from '@/polyfills/dom/types/MutationObserverRegistry';
import { type MutationRecordSink } from '@/polyfills/dom/types/MutationRecordSink';
import { isMutationOldValueRequested } from '@/polyfills/dom/utils/isMutationOldValueRequested';
import { isMutationRecordTypeObserved } from '@/polyfills/dom/utils/isMutationRecordTypeObserved';

export const createMutationObserverRegistry = (): MutationObserverRegistry => {
  const registrationsByTarget = new WeakMap<
    Node,
    MutationObserverRegistration[]
  >();
  let registrationCount = 0;

  return {
    registerObservation: ({ target, sink, options }) => {
      const registrations = registrationsByTarget.get(target) ?? [];
      const registrationsFromOtherSinks = registrations.filter(
        (registration) => registration.sink !== sink,
      );

      if (registrationsFromOtherSinks.length === registrations.length) {
        registrationCount += 1;
      }

      registrationsByTarget.set(target, [
        ...registrationsFromOtherSinks,
        { sink, options },
      ]);
    },

    unregisterObservations: ({ targets, sink }) => {
      for (const target of targets) {
        const registrations = registrationsByTarget.get(target);

        if (!isDefined(registrations)) {
          continue;
        }

        const remainingRegistrations = registrations.filter(
          (registration) => registration.sink !== sink,
        );

        registrationCount -=
          registrations.length - remainingRegistrations.length;
        registrationsByTarget.set(target, remainingRegistrations);
      }
    },

    broadcastMutationRecord: ({ record, oldValue }) => {
      if (registrationCount === 0) {
        return;
      }

      const oldValueRequestedBySink = new Map<MutationRecordSink, boolean>();

      let observedNode: Node | null = record.target;
      let isMutationTarget = true;

      while (isDefined(observedNode)) {
        for (const registration of registrationsByTarget.get(observedNode) ??
          []) {
          const isObservedFromThisNode =
            isMutationTarget || registration.options.subtree === true;

          if (
            !isObservedFromThisNode ||
            !isMutationRecordTypeObserved({
              options: registration.options,
              recordType: record.type,
              attributeName: record.attributeName,
            })
          ) {
            continue;
          }

          const oldValueRequested =
            (oldValueRequestedBySink.get(registration.sink) ?? false) ||
            isMutationOldValueRequested({
              options: registration.options,
              recordType: record.type,
            });

          oldValueRequestedBySink.set(registration.sink, oldValueRequested);
        }

        observedNode = observedNode.parentNode;
        isMutationTarget = false;
      }

      for (const [sink, oldValueRequested] of oldValueRequestedBySink) {
        sink.enqueueMutationRecord({
          ...record,
          oldValue: oldValueRequested ? oldValue : null,
        });
      }
    },
  };
};
