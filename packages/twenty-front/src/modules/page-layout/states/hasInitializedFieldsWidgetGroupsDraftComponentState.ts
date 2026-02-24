import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const hasInitializedFieldsWidgetGroupsDraftComponentState =
  createComponentStateV2<Record<string, boolean>>({
    key: 'hasInitializedFieldsWidgetGroupsDraftComponentState',
    defaultValue: {},
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
