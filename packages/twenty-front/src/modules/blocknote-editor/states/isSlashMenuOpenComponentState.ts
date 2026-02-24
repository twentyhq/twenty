import { BlockEditorComponentInstanceContext } from '@/blocknote-editor/contexts/BlockEditorCompoponeInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const isSlashMenuOpenComponentState = createComponentState<boolean>({
  key: 'isSlashMenuOpenComponentState',
  defaultValue: false,
  componentInstanceContext: BlockEditorComponentInstanceContext,
});
