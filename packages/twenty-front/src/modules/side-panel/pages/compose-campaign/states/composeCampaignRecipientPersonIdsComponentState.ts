import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const composeCampaignRecipientPersonIdsComponentState =
  createAtomComponentState<string[]>({
    key: 'side-panel/compose-campaign-recipient-person-ids',
    defaultValue: [],
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
