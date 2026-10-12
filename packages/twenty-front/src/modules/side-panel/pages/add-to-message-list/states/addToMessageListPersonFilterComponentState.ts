import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

export const addToMessageListPersonFilterComponentState =
  createAtomComponentState<RecordGqlOperationFilter | null>({
    key: 'side-panel/add-to-message-list-person-filter',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
