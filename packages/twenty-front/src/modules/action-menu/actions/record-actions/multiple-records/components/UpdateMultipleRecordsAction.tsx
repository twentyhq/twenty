import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { useOpenUpdateMultipleRecordsPageInCommandMenu } from '@/command-menu/hooks/useOpenUpdateMultipleRecordsPageInCommandMenu';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

export const UpdateMultipleRecordsAction = () => {
  const contextStoreInstanceId = useAvailableComponentInstanceIdOrThrow(
    ContextStoreComponentInstanceContext,
  );

  const { openUpdateMultipleRecordsPageInCommandMenu } =
    useOpenUpdateMultipleRecordsPageInCommandMenu({
      contextStoreInstanceId,
    });

  const handleClick = () => {
    openUpdateMultipleRecordsPageInCommandMenu();
  };

  return <ActionDisplay onClick={handleClick} />;
};
