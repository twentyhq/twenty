import { isDefined } from 'twenty-shared/utils';

import { type MutationObserverRegistration } from '@/polyfills/dom/types/MutationObserverRegistration';
import { type MutationObserverRegistry } from '@/polyfills/dom/types/MutationObserverRegistry';
import { type MutationRecordSink } from '@/polyfills/dom/types/MutationRecordSink';
import { createWorkerNodeList } from '@/polyfills/dom/utils/createWorkerNodeList';
import { hasTransientRegistrationForObservation } from '@/polyfills/dom/utils/hasTransientRegistrationForObservation';
import { isMutationOldValueRequested } from '@/polyfills/dom/utils/isMutationOldValueRequested';
import { isMutationRecordTypeObserved } from '@/polyfills/dom/utils/isMutationRecordTypeObserved';

const NO_REGISTRATIONS: MutationObserverRegistration[] = [];

export const createMutationObserverRegistry = (): MutationObserverRegistry => {
  const registrationsByTarget = new WeakMap<
    Node,
    MutationObserverRegistration[]
  >();
  const transientTargetsBySink = new Map<MutationRecordSink, Set<Node>>();
  const oldValueRequestedBySink = new Map<MutationRecordSink, boolean>();

  return {
    registerObservation: ({ target, sink, options }) => {
      const registrations =
        registrationsByTarget.get(target) ?? NO_REGISTRATIONS;

      registrationsByTarget.set(target, [
        ...registrations.filter((registration) => registration.sink !== sink),
        { sink, options, isTransient: false },
      ]);
    },

    unregisterObservations: ({ targets, sink }) => {
      for (const target of targets) {
        const registrations = registrationsByTarget.get(target);

        if (!isDefined(registrations)) {
          continue;
        }

        registrationsByTarget.set(
          target,
          registrations.filter((registration) => registration.sink !== sink),
        );
      }
    },

    registerTransientObservations: ({ detachedNode, formerParent }) => {
      const nextRegistrations = [
        ...(registrationsByTarget.get(detachedNode) ?? NO_REGISTRATIONS),
      ];
      const addedRegistrations: MutationObserverRegistration[] = [];

      let ancestor: Node | null = formerParent;

      while (isDefined(ancestor)) {
        for (const registration of registrationsByTarget.get(ancestor) ??
          NO_REGISTRATIONS) {
          if (
            registration.options.subtree !== true ||
            hasTransientRegistrationForObservation({
              registrations: nextRegistrations,
              sink: registration.sink,
              options: registration.options,
            })
          ) {
            continue;
          }

          const transientRegistration: MutationObserverRegistration = {
            sink: registration.sink,
            options: registration.options,
            isTransient: true,
          };

          nextRegistrations.push(transientRegistration);
          addedRegistrations.push(transientRegistration);
        }

        ancestor = ancestor.parentNode;
      }

      if (addedRegistrations.length === 0) {
        return;
      }

      registrationsByTarget.set(detachedNode, nextRegistrations);

      for (const { sink } of addedRegistrations) {
        const transientTargets = transientTargetsBySink.get(sink) ?? new Set();

        transientTargets.add(detachedNode);
        transientTargetsBySink.set(sink, transientTargets);

        sink.scheduleDelivery();
      }
    },

    clearTransientObservations: ({ sink }) => {
      const transientTargets = transientTargetsBySink.get(sink);

      if (!isDefined(transientTargets)) {
        return;
      }

      transientTargetsBySink.delete(sink);

      for (const target of transientTargets) {
        const registrations = registrationsByTarget.get(target);

        if (!isDefined(registrations)) {
          continue;
        }

        registrationsByTarget.set(
          target,
          registrations.filter(
            (registration) =>
              !registration.isTransient || registration.sink !== sink,
          ),
        );
      }
    },

    broadcastMutationRecord: ({ record, oldValue }) => {
      oldValueRequestedBySink.clear();

      let observedNode: Node | null = record.target;

      while (isDefined(observedNode)) {
        const isMutationTarget = observedNode === record.target;

        for (const registration of registrationsByTarget.get(observedNode) ??
          NO_REGISTRATIONS) {
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
      }

      for (const [sink, oldValueRequested] of oldValueRequestedBySink) {
        sink.enqueueMutationRecord({
          ...record,
          addedNodes: createWorkerNodeList(record.addedNodes),
          removedNodes: createWorkerNodeList(record.removedNodes),
          oldValue: oldValueRequested ? oldValue : null,
        });
      }
    },
  };
};
