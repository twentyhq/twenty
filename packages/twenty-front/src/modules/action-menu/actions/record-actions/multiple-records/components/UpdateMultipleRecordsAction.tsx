import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { useOpenUpdateMultipleRecordsPageInSidePanel } from '@/side-panel/hooks/useOpenUpdateMultipleRecordsPageInSidePanel';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

export const UpdateMultipleRecordsAction = () => {
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

  return <ActionDisplay onClick={handleClick} />;
};
