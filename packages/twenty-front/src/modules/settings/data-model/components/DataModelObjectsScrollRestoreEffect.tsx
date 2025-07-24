import { lastVisitedDataModelObjectState } from '@/settings/data-model/states/lastVisitedDataModelObjectState';
import { ScrollRestoreEffect } from '@/ui/utilities/scroll/components/ScrollRestoreEffect';

const DATA_MODEL_OBJECT_ROW_ID_PREFIX = 'data-model-object-row';

export const DataModelObjectsScrollRestoreEffect = () => {
  return (
    <ScrollRestoreEffect
      lastVisitedItemState={lastVisitedDataModelObjectState}
      idPrefix={DATA_MODEL_OBJECT_ROW_ID_PREFIX}
    />
  );
};

export { DATA_MODEL_OBJECT_ROW_ID_PREFIX };
