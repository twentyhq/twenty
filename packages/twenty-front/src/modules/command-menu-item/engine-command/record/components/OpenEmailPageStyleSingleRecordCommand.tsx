import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useOpenEmailPageStyleInSidePanel } from '@/side-panel/hooks/useOpenEmailPageStyleInSidePanel';

export const OpenEmailPageStyleSingleRecordCommand = () => {
  const { openEmailPageStyleInSidePanel } = useOpenEmailPageStyleInSidePanel();

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={openEmailPageStyleInSidePanel}
      ready
    />
  );
};
