import { useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useReadableObjectMetadataItems } from '@/object-metadata/hooks/useReadableObjectMetadataItems';
import { sidePanelShowHiddenObjectsState } from '@/side-panel/states/sidePanelShowHiddenObjectsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsWorkflowCoreEnabled } from '@/workflow/hooks/useIsWorkflowCoreEnabled';

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
  const isWorkflowCoreEnabled = useIsWorkflowCoreEnabled();

  return useMemo(() => {
    const isSearchableObjectNameSingular = (objectNameSingular: string) =>
      !isWorkflowCoreEnabled ||
      objectNameSingular !== CoreObjectNameSingular.Workflow;

    if (isDefined(selectedObjectNameSingular)) {
      return isSearchableObjectNameSingular(selectedObjectNameSingular)
        ? [selectedObjectNameSingular]
        : [];
    }

    return readableObjectMetadataItems
      .filter((item) => sidePanelShowHiddenObjects || item.isSearchable)
      .map((item) => item.nameSingular)
      .filter(isSearchableObjectNameSingular);
  }, [
    readableObjectMetadataItems,
    selectedObjectNameSingular,
    sidePanelShowHiddenObjects,
    isWorkflowCoreEnabled,
  ]);
};
