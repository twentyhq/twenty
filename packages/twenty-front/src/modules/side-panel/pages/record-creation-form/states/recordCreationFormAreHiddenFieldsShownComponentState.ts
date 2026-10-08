import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordCreationFormAreHiddenFieldsShownComponentState =
  createAtomComponentState<boolean>({
    key: 'side-panel/record-creation-form-are-hidden-fields-shown',
    defaultValue: false,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
