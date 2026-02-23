import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { coreViewFromViewIdFamilySelector } from '@/views/states/selectors/coreViewFromViewIdFamilySelector';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordIndexLoadBaseOnContextStoreEffect = () => {
  const { loadRecordIndexStates } = useLoadRecordIndexStates();
  const contextStoreCurrentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
  );

  const [loadedViewId, setLoadedViewId] = useState<string | undefined>(
    undefined,
  );

  const view = useFamilySelectorValueV2(coreViewFromViewIdFamilySelector, {
    viewId: contextStoreCurrentViewId ?? '',
  });

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  useEffect(() => {
    if (loadedViewId === contextStoreCurrentViewId) {
      return;
    }

    if (!isDefined(objectMetadataItem)) {
      return;
    }

    if (isDefined(view)) {
      loadRecordIndexStates(view, objectMetadataItem);
      setLoadedViewId(contextStoreCurrentViewId);
    }
  }, [
    contextStoreCurrentViewId,
    loadRecordIndexStates,
    loadedViewId,
    objectMetadataItem,
    view,
  ]);

  return <></>;
};
