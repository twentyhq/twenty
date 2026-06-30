import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { sidePanelShowHiddenObjectsState } from '@/side-panel/states/sidePanelShowHiddenObjectsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type UseSearchableObjectNameSingularsParams = {
  selectedObjectNameSingular?: string | null;
};

export const useSearchableObjectNameSingulars = ({
  selectedObjectNameSingular = null,
}: UseSearchableObjectNameSingularsParams = {}) => {
  const { readableObjectMetadataItems } = useReadableObjectMetadataItems();
  const sidePanelShowHiddenObjects = useAtomStateValue(
    sidePanelShowHiddenObjectsState,
  );

  return useMemo(() => {
    if (isDefined(selectedObjectNameSingular)) {
      return [selectedObjectNameSingular];
    }

    return readableObjectMetadataItems
      .filter((item) => sidePanelShowHiddenObjects || item.isSearchable)
      .map((item) => item.nameSingular);
  }, [
    readableObjectMetadataItems,
    selectedObjectNameSingular,
    sidePanelShowHiddenObjects,
  ]);
};
