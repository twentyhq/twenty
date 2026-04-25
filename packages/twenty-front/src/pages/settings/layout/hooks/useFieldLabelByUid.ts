import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

// Map<universalIdentifier, fieldLabel> over manifest fields + workspace fields,
// for resolving fieldMetadataUniversalIdentifier references in view filters,
// sorts, fields, and widget configurations.
export const useFieldLabelByUid = (manifest: Manifest | undefined) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  return useMemo(() => {
    const map = new Map<string, string>();

    for (const field of manifest?.fields ?? []) {
      if (isDefined(field.universalIdentifier)) {
        map.set(field.universalIdentifier, field.label ?? field.name);
      }
    }

    for (const item of objectMetadataItems) {
      for (const field of item.fields) {
        if (isDefined(field.universalIdentifier)) {
          map.set(field.universalIdentifier, field.label);
        }
      }
    }

    return map;
  }, [manifest?.fields, objectMetadataItems]);
};
