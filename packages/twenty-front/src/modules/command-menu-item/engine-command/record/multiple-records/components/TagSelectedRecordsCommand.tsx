import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenTagSelectedPageInSidePanel } from '@/side-panel/hooks/useOpenTagSelectedPageInSidePanel';

export const TagSelectedRecordsCommand = () => {
  const { contextStoreInstanceId } = useHeadlessCommandContextApi();

  const { openTagSelectedPageInSidePanel } = useOpenTagSelectedPageInSidePanel({
    contextStoreInstanceId,
  });

  return (
    <HeadlessEngineCommandWrapperEffect execute={openTagSelectedPageInSidePanel} />
  );
};
