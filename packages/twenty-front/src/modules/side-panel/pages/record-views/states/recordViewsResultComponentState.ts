import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type View } from '@/views/types/View';

export type RecordViewsResult = {
  views: View[];
  loading: boolean;
  error: boolean;
};

export const recordViewsResultComponentState =
  createAtomComponentState<RecordViewsResult>({
    key: 'side-panel/record-views-result',
    defaultValue: { views: [], loading: true, error: false },
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
