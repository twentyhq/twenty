import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutTabSettingsOpenTabIdComponentState =
  createComponentStateV2<string | null>({
    key: 'pageLayoutTabSettingsOpenTabIdComponentState',
    defaultValue: null,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
