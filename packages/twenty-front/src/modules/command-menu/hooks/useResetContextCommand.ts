import { useCopyContextStoreStates } from '@/command-menu/hooks/useCopyContextStoreAndActionMenuStates';
import { useResetContextStoreStates } from '@/command-menu/hooks/useResetContextStoreStates';
import { Command } from '@/command-menu/types/Command';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { t } from '@lingui/core/macro';
import { IconCheckbox } from 'twenty-ui';

export const useResetContextToSelection = () => {
  const contextStoreTargetedRecordsRuleComponent = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
    'command-menu-previous',
  );

  const { copyContextStoreStates } = useCopyContextStoreStates();

  const { resetContextStoreStates } = useResetContextStoreStates();

  if (
    contextStoreTargetedRecordsRuleComponent.mode !== 'selection' ||
    contextStoreTargetedRecordsRuleComponent.selectedRecordIds.length === 0
  ) {
    return { resetContextCommand: undefined };
  }

  const resetContextCommand: Command = {
    id: 'reset-context',
    label: t`Reset context to selection`,
    Icon: IconCheckbox,
    onCommandClick: () => {
      copyContextStoreStates({
        instanceIdToCopy: 'command-menu-previous',
        instanceIdToCopyTo: 'command-menu',
      });

      resetContextStoreStates('command-menu-previous');
    },
  };

  return { resetContextCommand };
};
