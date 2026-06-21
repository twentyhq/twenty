import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useOpenCampaignComposerInSidePanel } from '@/side-panel/hooks/useOpenCampaignComposerInSidePanel';

export const ComposeCampaignCommand = () => {
  const { openCampaignComposerInSidePanel } =
    useOpenCampaignComposerInSidePanel();

  const handleExecute = () => {
    openCampaignComposerInSidePanel();
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} ready />;
};
