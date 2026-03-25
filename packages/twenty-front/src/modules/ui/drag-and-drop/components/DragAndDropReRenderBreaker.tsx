import { memo } from 'react';

/**
 * THIS IS REQUIRED BY THE DND LYBRARY ONLY
 * DO NOT USE THIS PATTERN ELSEWHERE IN THE APPLICATION
 *
 * @deprecated This should be replaced by a more recent dnd library that does not force the re-render of its dragged components, which is a bad practice in React.
 */
export const DragAndDropLibraryLegacyReRenderBreaker = memo(
  ({
    children,
  }: React.PropsWithChildren<{
    memoizationId: string;
  }>) => {
    return <>{children}</>;
  },
  (prev, next) => {
    return prev.memoizationId === next.memoizationId;
  },
);
