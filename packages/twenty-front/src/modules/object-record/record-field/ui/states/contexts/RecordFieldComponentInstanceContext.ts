import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';

type RecordFieldComponentInstanceContextProps = { instanceId: string };

export const RecordFieldComponentInstanceContext =
  createComponentInstanceContext<RecordFieldComponentInstanceContextProps>({
    surfaceScope: 'shared',
  });
