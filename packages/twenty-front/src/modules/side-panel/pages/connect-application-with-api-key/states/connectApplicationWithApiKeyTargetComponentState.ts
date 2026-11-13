import { type ConnectApplicationWithApiKeyTarget } from '@/side-panel/pages/connect-application-with-api-key/types/ConnectApplicationWithApiKeyTarget';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const connectApplicationWithApiKeyTargetComponentState =
  createAtomComponentState<ConnectApplicationWithApiKeyTarget | null>({
    key: 'side-panel/connect-application-with-api-key-target',
    defaultValue: null,
    componentInstanceContext: SidePanelPageComponentInstanceContext,
  });
