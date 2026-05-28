import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const composeCampaignDefaultSubjectComponentState =
  createAtomComponentState<string>({
    key: 'side-panel/compose-campaign-default-subject',
    defaultValue: '',
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
