import { BlockEditorComponentInstanceContext } from '@/ui/input/editor/contexts/BlockEditorCompoponeInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const isSlashMenuOpenComponentState = createComponentStateV2<boolean>({
  key: 'isSlashMenuOpenComponentState',
  defaultValue: false,
  componentInstanceContext: BlockEditorComponentInstanceContext,
});
