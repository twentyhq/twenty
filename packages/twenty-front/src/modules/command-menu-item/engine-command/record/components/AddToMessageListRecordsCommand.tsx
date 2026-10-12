import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenAddToMessageListInSidePanel } from '@/side-panel/hooks/useOpenAddToMessageListInSidePanel';
import { isDefined } from 'twenty-shared/utils';

export const AddToMessageListRecordsCommand = () => {
  const { graphqlFilter } = useHeadlessCommandContextApi();
  const { openAddToMessageListInSidePanel } =
    useOpenAddToMessageListInSidePanel();

  const handleExecute = () => {
    if (!isDefined(graphqlFilter)) {
      throw new Error('Cannot add people to a list without a valid filter');
    }

    openAddToMessageListInSidePanel(graphqlFilter);
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
