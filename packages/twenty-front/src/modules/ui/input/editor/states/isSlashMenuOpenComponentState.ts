import { BlockEditorComponentInstanceContext } from '@/ui/input/editor/contexts/BlockEditorCompoponeInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isSlashMenuOpenComponentState = createComponentState<boolean>({
  key: 'isSlashMenuOpenComponentState',
  defaultValue: false,
  componentInstanceContext: BlockEditorComponentInstanceContext,
});
