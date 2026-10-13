import { isArray, isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { isOlderThanLatestNativeEdit } from '@/host/caret/utils/isOlderThanLatestNativeEdit';
import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';
import { type HostScrollController } from '@/host/scroll/types/HostScrollController';
import { type ReceivedScrollCommand } from '@/host/scroll/types/ReceivedScrollCommand';
import { applyScrollRequest } from '@/host/scroll/utils/applyScrollRequest';
import { parseScrollRequest } from '@/host/scroll/utils/parseScrollRequest';
import { readNewScrollCommands } from '@/host/scroll/utils/readNewScrollCommands';
import { readScrolledElementPosition } from '@/host/scroll/utils/readScrolledElementPosition';
import { type ScrollCommandAcknowledgement } from '@/types/ScrollCommandAcknowledgement';
import { type ScrolledElementPosition } from '@/types/ScrolledElementPosition';

type PendingScrollCommands = {
  scrollCommands: unknown;
  onScrollUpdate: unknown;
};

type PendingScrollAcknowledgement = {
  onScrollUpdate: unknown;
  scrollCommandSequence: number;
  scrolledNodes: Set<Element>;
};

type ScrollCommandCandidate = {
  remoteElementId: string;
  scrollCommand: ReceivedScrollCommand;
};

export const createHostScrollController = ({
  geometryTracker,
}: {
  geometryTracker: GeometryTracker;
}): HostScrollController => {
  const pendingScrollCommandsByRemoteElementId = new Map<
    string,
    PendingScrollCommands
  >();
  const appliedSequenceByRemoteElementId = new Map<string, number>();
  let generation = 0;
  let isFlushScheduled = false;

  const isOwnedNode = (node: Element): boolean => {
    const remoteElementId =
      geometryTracker.findRemoteElementIdContainingNode(node);

    return (
      isDefined(remoteElementId) &&
      geometryTracker.getRegisteredNode(remoteElementId) === node
    );
  };

  const applyScrollCommand = ({
    remoteElementId,
    scrollCommand,
  }: ScrollCommandCandidate): Element[] => {
    const node = geometryTracker.getRegisteredNode(remoteElementId);

    if (!isDefined(node) || !node.isConnected) {
      return [];
    }

    if (
      isOlderThanLatestNativeEdit({
        hostElement: node,
        nativeEditSequence: scrollCommand.acknowledgedNativeEditSequence,
      })
    ) {
      return [];
    }

    const request = parseScrollRequest(scrollCommand.request);

    if (!isDefined(request)) {
      return [];
    }

    return applyScrollRequest({ node, request, isOwnedNode });
  };

  const readScrolledElementPositions = (
    scrolledNodes: Set<Element>,
  ): ScrolledElementPosition[] => {
    const scrolledElementPositions: ScrolledElementPosition[] = [];

    for (const scrolledNode of scrolledNodes) {
      const remoteElementId =
        geometryTracker.findRemoteElementIdContainingNode(scrolledNode);

      if (isDefined(remoteElementId)) {
        scrolledElementPositions.push(
          readScrolledElementPosition({ node: scrolledNode, remoteElementId }),
        );
      }
    }

    return scrolledElementPositions;
  };

  const notifyScrollUpdate = ({
    onScrollUpdate,
    scrollCommandSequence,
    scrolledNodes,
  }: PendingScrollAcknowledgement): void => {
    if (!isFunction(onScrollUpdate)) {
      return;
    }

    const acknowledgement: ScrollCommandAcknowledgement = {
      scrollCommandSequence,
      scrollPositions: readScrolledElementPositions(scrolledNodes),
    };

    onScrollUpdate(acknowledgement);
  };

  const flush = (scheduledGeneration: number): void => {
    if (scheduledGeneration !== generation) {
      return;
    }

    isFlushScheduled = false;

    const acknowledgements = new Map<string, PendingScrollAcknowledgement>();
    const candidates: ScrollCommandCandidate[] = [];

    for (const [
      remoteElementId,
      { scrollCommands, onScrollUpdate },
    ] of pendingScrollCommandsByRemoteElementId) {
      if (isArray(scrollCommands) && scrollCommands.length === 0) {
        appliedSequenceByRemoteElementId.delete(remoteElementId);
        continue;
      }

      const newScrollCommands = readNewScrollCommands({
        scrollCommands,
        appliedSequence:
          appliedSequenceByRemoteElementId.get(remoteElementId) ?? 0,
      });
      const lastScrollCommand = newScrollCommands[newScrollCommands.length - 1];

      if (!isDefined(lastScrollCommand)) {
        continue;
      }

      appliedSequenceByRemoteElementId.set(
        remoteElementId,
        lastScrollCommand.sequence,
      );
      acknowledgements.set(remoteElementId, {
        onScrollUpdate,
        scrollCommandSequence: lastScrollCommand.sequence,
        scrolledNodes: new Set(),
      });

      for (const scrollCommand of newScrollCommands) {
        candidates.push({ remoteElementId, scrollCommand });
      }
    }

    pendingScrollCommandsByRemoteElementId.clear();

    const orderedCandidates = candidates.sort(
      (firstCandidate, secondCandidate) =>
        firstCandidate.scrollCommand.sequence -
        secondCandidate.scrollCommand.sequence,
    );

    for (const candidate of orderedCandidates) {
      const scrolledNodes = acknowledgements.get(
        candidate.remoteElementId,
      )?.scrolledNodes;

      for (const scrolledNode of applyScrollCommand(candidate)) {
        scrolledNodes?.add(scrolledNode);
      }
    }

    for (const acknowledgement of acknowledgements.values()) {
      notifyScrollUpdate(acknowledgement);
    }
  };

  return {
    enqueueScrollCommands: ({
      remoteElementId,
      scrollCommands,
      onScrollUpdate,
    }) => {
      pendingScrollCommandsByRemoteElementId.set(remoteElementId, {
        scrollCommands,
        onScrollUpdate,
      });

      if (isFlushScheduled) {
        return;
      }

      isFlushScheduled = true;
      const scheduledGeneration = generation;

      queueMicrotask(() => flush(scheduledGeneration));
    },
    reset: () => {
      generation += 1;
      isFlushScheduled = false;
      pendingScrollCommandsByRemoteElementId.clear();
      appliedSequenceByRemoteElementId.clear();
    },
  };
};
