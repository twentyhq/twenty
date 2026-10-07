import { isFunction } from '@sniptt/guards';
import { type RefObject } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { isSameInputSelectionSnapshot } from '@/host/caret/utils/isSameInputSelectionSnapshot';
import { type InputSelectionSnapshot } from '@/types/InputSelectionSnapshot';
import { type InputSelectionState } from '@/types/InputSelectionState';
import { readInputSelectionState } from '@/utils/readInputSelectionState';

const UNSUPPORTED_INPUT_SELECTION_STATE: InputSelectionState = {
  selectionStart: null,
  selectionEnd: null,
  selectionDirection: null,
};

type InputSelectionPublication = {
  subscriber: unknown;
  snapshot: InputSelectionSnapshot;
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
  let lastPublication: InputSelectionPublication | undefined;

  const isUnchangedSinceLastPublication = ({
    subscriber,
    snapshot,
  }: InputSelectionPublication): boolean =>
    isDefined(lastPublication) &&
    lastPublication.subscriber === subscriber &&
    isSameInputSelectionSnapshot({
      previousSnapshot: lastPublication.snapshot,
      nextSnapshot: snapshot,
    });

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
      isUnchangedSinceLastPublication({ subscriber, snapshot })
    ) {
      return;
    }

    lastPublication = { subscriber, snapshot };
    subscriber(snapshot);
  };
};
