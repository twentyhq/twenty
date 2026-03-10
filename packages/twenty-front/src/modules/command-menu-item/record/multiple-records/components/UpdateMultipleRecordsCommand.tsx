import { CommandMenuItemDisplay } from '@/command-menu-item/display/components/CommandMenuItemDisplay';
import { useOpenUpdateMultipleRecordsPageInSidePanel } from '@/side-panel/hooks/useOpenUpdateMultipleRecordsPageInSidePanel';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

export const UpdateMultipleRecordsCommand = () => {
  const contextStoreInstanceId = useAvailableComponentInstanceIdOrThrow(
    ContextStoreComponentInstanceContext,
  );

  const { openUpdateMultipleRecordsPageInSidePanel } =
    useOpenUpdateMultipleRecordsPageInSidePanel({
      contextStoreInstanceId,
    });

  const handleClick = () => {
    openUpdateMultipleRecordsPageInSidePanel();
  };

  return <CommandMenuItemDisplay onClick={handleClick} />;
};
