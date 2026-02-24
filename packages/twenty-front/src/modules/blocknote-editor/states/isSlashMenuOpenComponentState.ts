import { BlockEditorComponentInstanceContext } from '@/blocknote-editor/contexts/BlockEditorCompoponeInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const isSlashMenuOpenComponentState = createComponentStateV2<boolean>({
  key: 'isSlashMenuOpenComponentState',
  defaultValue: false,
  componentInstanceContext: BlockEditorComponentInstanceContext,
});
