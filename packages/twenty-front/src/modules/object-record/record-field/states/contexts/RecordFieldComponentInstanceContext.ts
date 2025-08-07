import { ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';

type RecordFieldComponentInstanceContextProps = ComponentStateKey;

export const RecordFieldComponentInstanceContext =
  createComponentInstanceContext<RecordFieldComponentInstanceContextProps>();
