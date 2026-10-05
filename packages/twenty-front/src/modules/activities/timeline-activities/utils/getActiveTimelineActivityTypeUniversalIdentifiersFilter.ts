import { isNonEmptyArray } from 'twenty-shared/utils';

export const getActiveTimelineActivityTypeUniversalIdentifiersFilter = ({
  activeUniversalIdentifiers,
  selectedUniversalIdentifiers,
}: {
  activeUniversalIdentifiers: string[];
  selectedUniversalIdentifiers: string[];
}): string[] | null => {
  if (!isNonEmptyArray(selectedUniversalIdentifiers)) {
    return null;
  }

  const activeUniversalIdentifierSet = new Set(activeUniversalIdentifiers);

  return selectedUniversalIdentifiers.filter((universalIdentifier) =>
    activeUniversalIdentifierSet.has(universalIdentifier),
  );
};
