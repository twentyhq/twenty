import { RecordPickerComponentInstanceContext } from '@/object-record/record-picker/states/contexts/RecordPickerComponentInstanceContext';
import { Decorator } from '@storybook/react';

export const RecordPickerDecorator: Decorator = (Story) => (
  <RecordPickerComponentInstanceContext.Provider
    value={{ instanceId: 'record-picker-decorator-instance-id' }}
  >
    <Story />
  </RecordPickerComponentInstanceContext.Provider>
);
