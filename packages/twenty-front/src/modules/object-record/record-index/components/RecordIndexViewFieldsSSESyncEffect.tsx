import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useLoadRecordIndexStates } from '@/object-record/record-index/hooks/useLoadRecordIndexStates';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { viewFromViewIdFamilySelector } from '@/views/states/selectors/viewFromViewIdFamilySelector';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { AllMetadataName } from '~/generated-metadata/graphql';

// View fields can arrive after the record index has already loaded (e.g. while
// AI is still creating metadata). We re-sync the record index fields directly
// on the viewField metadata event rather than reactively, reading the current
// view from the store at call time so it reflects the just-applied change.
export const RecordIndexViewFieldsSSESyncEffect = () => {
  const store = useStore();

  const { syncRecordIndexViewFields } = useLoadRecordIndexStates();
  const { objectMetadataItem } = useContextStoreObjectMetadataItemOrThrow();

  const contextStoreCurrentViewId = useAtomComponentStateValue(
    contextStoreCurrentViewIdComponentState,
  );

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.viewField,
    onMetadataOperationBrowserEvent: () => {
      if (!isDefined(contextStoreCurrentViewId)) {
        return;
      }

      const currentView = store.get(
        viewFromViewIdFamilySelector.selectorFamily({
          viewId: contextStoreCurrentViewId,
        }),
      );

      if (!isDefined(currentView)) {
        return;
      }

      syncRecordIndexViewFields(currentView, objectMetadataItem);
    },
  });

  return null;
};
