import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export type MergeWithRecordSource = {
  objectNameSingular: string;
  recordId: string;
};

export const mergeWithRecordSourceComponentState =
  createAtomComponentState<MergeWithRecordSource | null>({
    key: 'side-panel/merge-with-record-source',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
