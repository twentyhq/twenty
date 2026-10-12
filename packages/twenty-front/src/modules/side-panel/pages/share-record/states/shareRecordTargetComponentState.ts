import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type RecordTargetInput } from '~/generated-metadata/graphql';

export const shareRecordTargetComponentState =
  createAtomComponentState<RecordTargetInput | null>({
    key: 'side-panel/share-record-target',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
