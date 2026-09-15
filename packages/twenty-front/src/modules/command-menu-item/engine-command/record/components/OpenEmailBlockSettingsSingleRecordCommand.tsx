import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useOpenEmailBlockSettingsInSidePanel } from '@/side-panel/hooks/useOpenEmailBlockSettingsInSidePanel';

export const OpenEmailBlockSettingsSingleRecordCommand = () => {
  const { openEmailBlockSettingsInSidePanel } =
    useOpenEmailBlockSettingsInSidePanel();

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={openEmailBlockSettingsInSidePanel}
      ready
    />
  );
};
