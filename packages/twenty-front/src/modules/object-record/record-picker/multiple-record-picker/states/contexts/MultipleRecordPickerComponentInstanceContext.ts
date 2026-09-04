import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';

type MultipleRecordPickerComponentInstanceContextProps = { instanceId: string };

export const MultipleRecordPickerComponentInstanceContext =
  createComponentInstanceContext<MultipleRecordPickerComponentInstanceContextProps>(
    {
      surfaceScope: 'shared',
    },
  );
