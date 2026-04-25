import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';
import { type Manifest } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

// Builds a UID → field label lookup from the union of manifest-defined fields
// (this app's contributions) and workspace fields (standard objects' fields).
// Detail pages need this to render "fieldMetadataUniversalIdentifier" references
// in view filters/sorts/fields and widget configurations as readable labels.
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
