import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordCreationFormDraftComponentState =
  createAtomComponentState<Partial<ObjectRecord> | null>({
    key: 'side-panel/record-creation-form-draft',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
