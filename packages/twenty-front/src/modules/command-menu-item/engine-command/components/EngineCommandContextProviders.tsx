import { DefaultPageEngineCommandContextProviders } from '@/command-menu-item/engine-command/components/DefaultPageEngineCommandContextProviders';
import { IndexPageEngineCommandContextProviders } from '@/command-menu-item/engine-command/components/IndexPageEngineCommandContextProviders';
import { RecordPageEngineCommandContextProviders } from '@/command-menu-item/engine-command/components/RecordPageEngineCommandContextProviders';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const EngineCommandContextProviders = ({
  engineCommandId,
  children,
}: {
  engineCommandId: string;
  children: React.ReactNode;
}) => {
  const contextStoreCurrentViewType = useAtomComponentStateValue(
    contextStoreCurrentViewTypeComponentState,
  );

  if (
    contextStoreCurrentViewType === ContextStoreViewType.Table ||
    contextStoreCurrentViewType === ContextStoreViewType.Kanban
  ) {
    return (
      <IndexPageEngineCommandContextProviders
        engineCommandId={engineCommandId}
      >
        {children}
      </IndexPageEngineCommandContextProviders>
    );
  }

  if (contextStoreCurrentViewType === ContextStoreViewType.ShowPage) {
    return (
      <RecordPageEngineCommandContextProviders
        engineCommandId={engineCommandId}
      >
        {children}
      </RecordPageEngineCommandContextProviders>
    );
  }

  return (
    <DefaultPageEngineCommandContextProviders
      engineCommandId={engineCommandId}
    >
      {children}
    </DefaultPageEngineCommandContextProviders>
  );
};
