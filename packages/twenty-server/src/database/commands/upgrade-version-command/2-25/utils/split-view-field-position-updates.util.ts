type ViewFieldPosition = {
  universalIdentifier: string;
  position: number;
};

// The migration builder validates updates one at a time against optimistic maps
// it mutates as it goes, so a batch is only valid if every intermediate state is
// valid too. Moving the column that ends up lowest at the same time as the ones
// it has to sit below can therefore be rejected: whether it passes depends on
// which update the builder happens to reach first.
//
// Applying the lowest column on its own, after the others have moved up, keeps
// every intermediate state valid whatever order the builder picks.
export const splitViewFieldPositionUpdates = <T extends ViewFieldPosition>(
  positionUpdates: T[],
): { others: T[]; lowest: T[] } => {
  if (positionUpdates.length <= 1) {
    return { others: [], lowest: positionUpdates };
  }

  const lowestPosition = Math.min(
    ...positionUpdates.map(({ position }) => position),
  );
  const lowestIndex = positionUpdates.findIndex(
    ({ position }) => position === lowestPosition,
  );

  return {
    others: positionUpdates.filter((_, index) => index !== lowestIndex),
    lowest: [positionUpdates[lowestIndex]],
  };
};
