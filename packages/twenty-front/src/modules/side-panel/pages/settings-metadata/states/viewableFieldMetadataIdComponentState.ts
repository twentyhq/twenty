import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const viewableFieldMetadataIdComponentState = createAtomComponentState<
  string | null
>({
  key: 'side-panel/viewable-field-metadata-id',
  defaultValue: null,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
