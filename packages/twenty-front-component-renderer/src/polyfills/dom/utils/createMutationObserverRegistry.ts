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
  const transientTargetsBySink = new Map<MutationRecordSink, Set<Node>>();
  let registrationCount = 0;

  const replaceRegistrations = (
    target: Node,
    registrations: MutationObserverRegistration[],
    nextRegistrations: MutationObserverRegistration[],
  ) => {
    registrationCount += nextRegistrations.length - registrations.length;
    registrationsByTarget.set(target, nextRegistrations);
  };

  return {
    registerObservation: ({ target, sink, options }) => {
      const registrations = registrationsByTarget.get(target) ?? [];

      replaceRegistrations(target, registrations, [
        ...registrations.filter((registration) => registration.sink !== sink),
        { sink, options },
      ]);
    },

    unregisterObservations: ({ targets, sink }) => {
      for (const target of targets) {
        const registrations = registrationsByTarget.get(target);

        if (!isDefined(registrations)) {
          continue;
        }

        replaceRegistrations(
          target,
          registrations,
          registrations.filter((registration) => registration.sink !== sink),
        );
      }
    },

    registerTransientObservations: ({ detachedNode, formerParent }) => {
      if (registrationCount === 0) {
        return;
      }

      const transientRegistrations: MutationObserverRegistration[] = [];
      let ancestor: Node | null = formerParent;

      while (isDefined(ancestor)) {
        for (const registration of registrationsByTarget.get(ancestor) ?? []) {
          if (registration.options.subtree !== true) {
            continue;
          }

          transientRegistrations.push({
            sink: registration.sink,
            options: registration.options,
            isTransient: true,
          });
        }

        ancestor = ancestor.parentNode;
      }

      if (transientRegistrations.length === 0) {
        return;
      }

      const registrations = registrationsByTarget.get(detachedNode) ?? [];

      replaceRegistrations(detachedNode, registrations, [
        ...registrations,
        ...transientRegistrations,
      ]);

      for (const { sink } of transientRegistrations) {
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

        replaceRegistrations(
          target,
          registrations,
          registrations.filter(
            (registration) =>
              registration.isTransient !== true || registration.sink !== sink,
          ),
        );
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
