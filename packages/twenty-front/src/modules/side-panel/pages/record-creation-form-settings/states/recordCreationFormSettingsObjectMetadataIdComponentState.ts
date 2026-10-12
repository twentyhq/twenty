import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordCreationFormSettingsObjectMetadataIdComponentState =
  createAtomComponentState<string | null>({
    key: 'side-panel/record-creation-form-settings-object-metadata-id',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
