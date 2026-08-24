export const removeInactiveTimelineActivityTypeUniversalIdentifiers = ({
  activeUniversalIdentifiers,
  selectedUniversalIdentifiers,
}: {
  activeUniversalIdentifiers: string[];
  selectedUniversalIdentifiers: string[];
}): string[] => {
  const activeUniversalIdentifierSet = new Set(activeUniversalIdentifiers);

  const remainingUniversalIdentifiers = selectedUniversalIdentifiers.filter(
    (universalIdentifier) =>
      activeUniversalIdentifierSet.has(universalIdentifier),
  );

  return remainingUniversalIdentifiers.length ===
    selectedUniversalIdentifiers.length
    ? selectedUniversalIdentifiers
    : remainingUniversalIdentifiers;
};
