import { lastVisitedObjectFieldState } from '@/settings/data-model/states/lastVisitedObjectFieldState';
import { ScrollRestoreEffect } from '@/ui/utilities/scroll/components/ScrollRestoreEffect';

const OBJECT_FIELD_ROW_ID_PREFIX = 'object-field-row';

export const ObjectFieldsScrollRestoreEffect = () => {
  return (
    <ScrollRestoreEffect
      lastVisitedItemState={lastVisitedObjectFieldState}
      idPrefix={OBJECT_FIELD_ROW_ID_PREFIX}
    />
  );
};

export { OBJECT_FIELD_ROW_ID_PREFIX };
