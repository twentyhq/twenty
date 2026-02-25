import { BlockEditorComponentInstanceContext } from '@/blocknote-editor/contexts/BlockEditorCompoponeInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const isSlashMenuOpenComponentState = createAtomComponentState<boolean>({
  key: 'isSlashMenuOpenComponentState',
  defaultValue: false,
  componentInstanceContext: BlockEditorComponentInstanceContext,
});
