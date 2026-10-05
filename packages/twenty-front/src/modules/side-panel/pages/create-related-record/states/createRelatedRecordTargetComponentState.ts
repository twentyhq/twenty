import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const createRelatedRecordTargetComponentState =
  createAtomComponentState<ActivityTargetableObject | null>({
    key: 'side-panel/create-related-record-target',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
