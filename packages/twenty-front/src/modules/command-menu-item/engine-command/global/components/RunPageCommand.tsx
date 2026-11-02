import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { contextStorePageCommandsComponentState } from '@/context-store/states/contextStorePageCommandsComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const RunPageCommand = () => {
  const { engineComponentKey } = useHeadlessCommandContextApi();

  const contextStorePageCommands = useAtomComponentStateValue(
    contextStorePageCommandsComponentState,
  );

  const pageCommand = contextStorePageCommands[engineComponentKey];

  const handleExecute = () => {
    if (
      !isDefined(pageCommand) ||
      pageCommand.isDisabled ||
      pageCommand.isLoading
    ) {
      return;
    }

    return pageCommand.run();
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
