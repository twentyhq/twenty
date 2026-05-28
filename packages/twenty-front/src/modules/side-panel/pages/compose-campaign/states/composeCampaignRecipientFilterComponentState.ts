import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const composeCampaignRecipientFilterComponentState =
  createAtomComponentState<RecordGqlOperationFilter | null>({
    key: 'side-panel/compose-campaign-recipient-filter',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
