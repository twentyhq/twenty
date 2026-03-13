import { EngineCommandIdContext } from '@/command-menu-item/engine-command/contexts/EngineCommandIdContext';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const RecordPageEngineCommandContextProviders = ({
  engineCommandId,
  children,
}: {
  engineCommandId: string;
  children: React.ReactNode;
}) => {
  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.id === contextStoreCurrentObjectMetadataItemId,
  );

  if (!objectMetadataItem) {
    return null;
  }

  return (
    <EngineCommandIdContext.Provider value={engineCommandId}>
      {children}
    </EngineCommandIdContext.Provider>
  );
};
