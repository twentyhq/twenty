import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenAddToMessageListInSidePanel } from '@/side-panel/hooks/useOpenAddToMessageListInSidePanel';
import { doNotTranslate, isDefined } from 'twenty-shared/utils';

export const AddRecordsToMessageListCommand = () => {
  const { graphqlFilter } = useHeadlessCommandContextApi();

  const { openAddToMessageListInSidePanel } =
    useOpenAddToMessageListInSidePanel();

  if (!isDefined(graphqlFilter)) {
    throw new Error(
      doNotTranslate('Selected records filter is required to add to a list'),
    );
  }

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={() => openAddToMessageListInSidePanel(graphqlFilter)}
    />
  );
};
