import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useCreateDefaultViewForObject } from '@/views/hooks/useCreateDefaultViewForObject';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const RecordIndexLoadBaseOnContextStoreEffect = () => {
  const { loadRecordIndexStates, syncRecordIndexViewFields } =
    useLoadRecordIndexStates();
  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  const [loadedViewId, setLoadedViewId] = useState<string | undefined>(
    undefined,
  );

  const view = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId: contextStoreCurrentViewId ?? '',
  });

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { createDefaultViewForObject } = useCreateDefaultViewForObject();

  useEffect(() => {
    if (!isDefined(objectMetadataItem)) {
      return;
    }

    if (!isDefined(view)) {
      createDefaultViewForObject(objectMetadataItem);
      return;
    }

    if (loadedViewId !== contextStoreCurrentViewId) {
      loadRecordIndexStates(view, objectMetadataItem);
      setLoadedViewId(contextStoreCurrentViewId);
      return;
    }

    // Re-sync record index fields when viewFields change after the initial
    // load (e.g. arriving late via SSE while AI is still creating metadata).
    // syncRecordIndexViewFields is idempotent, so it no-ops when unchanged.
    syncRecordIndexViewFields(view, objectMetadataItem);
  }, [
    contextStoreCurrentViewId,
    createDefaultViewForObject,
    loadRecordIndexStates,
    loadedViewId,
    objectMetadataItem,
    syncRecordIndexViewFields,
    view,
  ]);

  return <></>;
};
