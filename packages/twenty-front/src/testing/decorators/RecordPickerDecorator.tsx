import { Decorator } from '@storybook/react';

import { RecordPickerComponentInstanceContext } from '@/object-record/relation-picker/states/contexts/RecordPickerComponentInstanceContext';
import { RelationPickerHotkeyScope } from '@/object-record/relation-picker/types/RelationPickerHotkeyScope';

export const RecordPickerDecorator: Decorator = (Story) => (
  <RecordPickerComponentInstanceContext.Provider
    value={{ instanceId: RelationPickerHotkeyScope.RelationPicker }}
  >
    <Story />
  </RecordPickerComponentInstanceContext.Provider>
);
