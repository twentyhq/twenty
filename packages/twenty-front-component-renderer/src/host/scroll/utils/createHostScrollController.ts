import { isFunction } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';
import { type HostScrollController } from '@/host/scroll/types/HostScrollController';
import { applyScrollRequest } from '@/host/scroll/utils/applyScrollRequest';
import { parseScrollRequest } from '@/host/scroll/utils/parseScrollRequest';
import { readNewScrollCommands } from '@/host/scroll/utils/readNewScrollCommands';
import { readScrolledElementPosition } from '@/host/scroll/utils/readScrolledElementPosition';
import { type RemoteElementCommand } from '@/types/RemoteElementCommand';
import { type ScrollCommandAcknowledgement } from '@/types/ScrollCommandAcknowledgement';
import { type ScrolledElementPosition } from '@/types/ScrolledElementPosition';

type PendingScrollCommands = {
  scrollCommands: unknown[];
  onScrollUpdate: unknown;
};

type PendingScrollAcknowledgement = {
  onScrollUpdate: unknown;
  scrollCommandSequence: number;
  scrolledNodes: Set<Element>;
};

type ScrollCommandCandidate = {
  remoteElementId: string;
  scrollCommand: RemoteElementCommand<unknown>;
  scrolledNodes: Set<Element>;
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
  }: Pick<
    ScrollCommandCandidate,
    'remoteElementId' | 'scrollCommand'
  >): Element[] => {
    const node = geometryTracker.getRegisteredNode(remoteElementId);

    if (!isDefined(node) || !node.isConnected) {
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

  const flush = (): void => {
    isFlushScheduled = false;

    const acknowledgements: PendingScrollAcknowledgement[] = [];
    const candidates: ScrollCommandCandidate[] = [];

    for (const [
      remoteElementId,
      { scrollCommands, onScrollUpdate },
    ] of pendingScrollCommandsByRemoteElementId) {
      if (scrollCommands.length === 0) {
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

      const scrolledNodes = new Set<Element>();

      appliedSequenceByRemoteElementId.set(
        remoteElementId,
        lastScrollCommand.sequence,
      );
      acknowledgements.push({
        onScrollUpdate,
        scrollCommandSequence: lastScrollCommand.sequence,
        scrolledNodes,
      });

      for (const scrollCommand of newScrollCommands) {
        candidates.push({ remoteElementId, scrollCommand, scrolledNodes });
      }
    }

    pendingScrollCommandsByRemoteElementId.clear();

    candidates.sort(
      (firstCandidate, secondCandidate) =>
        firstCandidate.scrollCommand.sequence -
        secondCandidate.scrollCommand.sequence,
    );

    for (const candidate of candidates) {
      for (const scrolledNode of applyScrollCommand(candidate)) {
        candidate.scrolledNodes.add(scrolledNode);
      }
    }

    for (const acknowledgement of acknowledgements) {
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
      queueMicrotask(flush);
    },
    reset: () => {
      pendingScrollCommandsByRemoteElementId.clear();
      appliedSequenceByRemoteElementId.clear();
    },
  };
};
