import { isFunction } from '@sniptt/guards';
import { type RefObject } from 'react';
import { fastDeepEqual } from 'twenty-shared/utils';

import { type InputSelectionSnapshot } from '@/types/InputSelectionSnapshot';
import { type InputSelectionState } from '@/types/InputSelectionState';
import { readInputSelectionState } from '@/utils/readInputSelectionState';

const UNSUPPORTED_INPUT_SELECTION_STATE: InputSelectionState = {
  selectionStart: null,
  selectionEnd: null,
  selectionDirection: null,
};

export const createInputSelectionPublisher = ({
  attachedElementRef,
  latestOnSelectionUpdateRef,
  appliedSelectionSequenceRef,
}: {
  attachedElementRef: RefObject<Element | null>;
  latestOnSelectionUpdateRef: RefObject<unknown>;
  appliedSelectionSequenceRef: RefObject<number>;
}) => {
  let lastSubscriber: unknown;
  let lastSnapshot: InputSelectionSnapshot | undefined;

  return ({ shouldSkipUnchanged }: { shouldSkipUnchanged: boolean }) => {
    const subscriber = latestOnSelectionUpdateRef.current;

    if (!isFunction(subscriber)) {
      return;
    }

    const snapshot: InputSelectionSnapshot = {
      ...(readInputSelectionState(attachedElementRef.current) ??
        UNSUPPORTED_INPUT_SELECTION_STATE),
      selectionCommandSequence: appliedSelectionSequenceRef.current,
    };

    if (
      shouldSkipUnchanged &&
      subscriber === lastSubscriber &&
      fastDeepEqual(snapshot, lastSnapshot)
    ) {
      return;
    }

    lastSubscriber = subscriber;
    lastSnapshot = snapshot;
    subscriber(snapshot);
  };
};
