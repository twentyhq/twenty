import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const viewableObjectMetadataIdComponentState = createAtomComponentState<
  string | null
>({
  key: 'side-panel/viewable-object-metadata-id',
  defaultValue: null,
  componentInstanceContext: SidePanelPageComponentInstanceContext,
});
