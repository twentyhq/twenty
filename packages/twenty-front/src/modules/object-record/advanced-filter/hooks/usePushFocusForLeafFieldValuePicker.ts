import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

// RELATION and SELECT leaf fields open a value picker keyed by the field
// id once the user finishes choosing the field — push it on the focus
// stack so the picker's keyboard hotkeys are active when it opens. Other
// field types use input-style pickers that don't rely on the focus stack.
export const usePushFocusForLeafFieldValuePicker = () => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const pushFocusForLeafFieldValuePicker = (
    fieldMetadataItem: FieldMetadataItem,
  ) => {
    if (
      fieldMetadataItem.type !== 'RELATION' &&
      fieldMetadataItem.type !== 'SELECT'
    ) {
      return;
    }

    pushFocusItemToFocusStack({
      focusId: fieldMetadataItem.id,
      component: {
        type: FocusComponentType.DROPDOWN,
        instanceId: fieldMetadataItem.id,
      },
    });
  };

  return { pushFocusForLeafFieldValuePicker };
};
