import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const sendCampaignCampaignIdComponentState =
  createAtomComponentState<string>({
    key: 'side-panel/send-campaign-campaign-id',
    defaultValue: '',
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
