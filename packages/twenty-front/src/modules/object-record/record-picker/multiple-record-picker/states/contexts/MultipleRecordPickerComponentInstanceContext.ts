import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';

type MultipleRecordPickerComponentInstanceContextProps = ComponentStateKey;

export const MultipleRecordPickerComponentInstanceContext =
  createComponentInstanceContext<MultipleRecordPickerComponentInstanceContextProps>();
