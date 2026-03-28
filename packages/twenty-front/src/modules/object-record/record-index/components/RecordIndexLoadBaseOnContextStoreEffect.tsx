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
  const [syncedViewFieldsSignature, setSyncedViewFieldsSignature] = useState<
    string | undefined
  >(undefined);

  const view = useAtomFamilySelectorValue(viewFromViewIdFamilySelector, {
    viewId: contextStoreCurrentViewId ?? '',
  });

  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const { createDefaultViewForObject } = useCreateDefaultViewForObject();

  const viewFieldsSignature = isDefined(view)
    ? JSON.stringify(
        view.viewFields.map((viewField) => ({
          aggregateOperation: viewField.aggregateOperation,
          fieldMetadataId: viewField.fieldMetadataId,
          id: viewField.id,
          isVisible: viewField.isVisible,
          position: viewField.position,
          size: viewField.size,
        })),
      )
    : undefined;

  useEffect(() => {
    if (!isDefined(objectMetadataItem)) {
      return;
    }

    if (isDefined(view)) {
      if (loadedViewId !== contextStoreCurrentViewId) {
        loadRecordIndexStates(view, objectMetadataItem);
        setLoadedViewId(contextStoreCurrentViewId);
        setSyncedViewFieldsSignature(viewFieldsSignature);
        return;
      }

      if (syncedViewFieldsSignature !== viewFieldsSignature) {
        syncRecordIndexViewFields(view, objectMetadataItem);
        setSyncedViewFieldsSignature(viewFieldsSignature);
      }
    } else {
      createDefaultViewForObject(objectMetadataItem);
    }
  }, [
    contextStoreCurrentViewId,
    loadRecordIndexStates,
    loadedViewId,
    objectMetadataItem,
    syncedViewFieldsSignature,
    syncRecordIndexViewFields,
    view,
    viewFieldsSignature,
    createDefaultViewForObject,
  ]);

  return <></>;
};
