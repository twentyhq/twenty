import { type InputSelectionSnapshot } from '@/types/InputSelectionSnapshot';

export const isSameInputSelectionSnapshot = ({
  previousSnapshot,
  nextSnapshot,
}: {
  previousSnapshot: InputSelectionSnapshot;
  nextSnapshot: InputSelectionSnapshot;
}): boolean =>
  previousSnapshot.selectionStart === nextSnapshot.selectionStart &&
  previousSnapshot.selectionEnd === nextSnapshot.selectionEnd &&
  previousSnapshot.selectionDirection === nextSnapshot.selectionDirection &&
  previousSnapshot.selectionCommandSequence ===
    nextSnapshot.selectionCommandSequence;
