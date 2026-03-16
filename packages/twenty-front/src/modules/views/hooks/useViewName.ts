import { useMemo } from 'react';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { View } from '@/views/types/View';
import { getDynamicViewName } from '@/views/utils/getDynamicViewName';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useViewName = (view?: View) => {
  const featureFlags = useFeatureFlagsMap();
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);

  const objectMetadataId = view?.objectMetadataId;

  const objectMetadataItem = useMemo(() => {
    if (!isDefined(objectMetadataId)) {
      return null;
    }

    return (
      objectMetadataItems.find((item) => item.id === objectMetadataId) ?? null
    );
  }, [objectMetadataId, objectMetadataItems]);

  const viewName = useMemo(() => {
    if (!view) {
      return '';
    }

    const isDynamicNameEnabled =
      featureFlags[
        FeatureFlagKey.IS_STANDARD_VIEW_NAME_DYNAMIC_ENABLED as keyof typeof featureFlags
      ];

    if (isDynamicNameEnabled && objectMetadataItem) {
      return getDynamicViewName(view.name, objectMetadataItem.labelPlural);
    }

    return view.name;
  }, [view, featureFlags, objectMetadataItem]);

  return { viewName };
};
