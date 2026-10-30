import { type MergeWithRecordSource } from '@/side-panel/pages/merge-with-record/types/MergeWithRecordSource';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const mergeWithRecordSourceComponentState =
  createAtomComponentState<MergeWithRecordSource | null>({
    key: 'side-panel/merge-with-record-source',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
