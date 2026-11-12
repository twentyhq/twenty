import { isDefined } from 'twenty-shared/utils';

import { type ApplicationContentFilterOption } from '@/settings/applications/types/ApplicationContentFilterOption';
import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';
import { type ApplicationContentObjectResolver } from '@/settings/applications/types/ApplicationContentObjectResolver';

export const getApplicationContentParentFilterOptions = ({
  items,
  parents,
  resolveObject,
}: {
  items: Pick<
    ApplicationContentItem,
    'parentUniversalIdentifier' | 'parentLabel'
  >[];
  parents: Pick<
    ApplicationContentItem,
    'universalIdentifier' | 'label' | 'icon' | 'objectUniversalIdentifier'
  >[];
  resolveObject: ApplicationContentObjectResolver;
}): ApplicationContentFilterOption[] => {
  const optionsByUniversalIdentifier = new Map<
    string,
    ApplicationContentFilterOption
  >();

  for (const item of items) {
    const parentUniversalIdentifier = item.parentUniversalIdentifier;

    if (
      !isDefined(parentUniversalIdentifier) ||
      optionsByUniversalIdentifier.has(parentUniversalIdentifier)
    ) {
      continue;
    }

    const parent = parents.find(
      ({ universalIdentifier }) =>
        universalIdentifier === parentUniversalIdentifier,
    );

    optionsByUniversalIdentifier.set(parentUniversalIdentifier, {
      universalIdentifier: parentUniversalIdentifier,
      label: parent?.label ?? item.parentLabel ?? parentUniversalIdentifier,
      icon: parent?.icon,
      color: resolveObject(parent?.objectUniversalIdentifier)?.color,
    });
  }

  return [...optionsByUniversalIdentifier.values()];
};
