import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const sendCampaignTestCampaignIdComponentState =
  createAtomComponentState<string>({
    key: 'side-panel/send-campaign-test-campaign-id',
    defaultValue: '',
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
