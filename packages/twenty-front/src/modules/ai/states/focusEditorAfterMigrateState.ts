import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const focusEditorAfterMigrateState = createAtomState<boolean>({
  key: 'ai/focusEditorAfterMigrateState',
  defaultValue: false,
});
