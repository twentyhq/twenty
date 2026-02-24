import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const hasInitializedFieldsWidgetGroupsDraftComponentState =
  createComponentState<Record<string, boolean>>({
    key: 'hasInitializedFieldsWidgetGroupsDraftComponentState',
    defaultValue: {},
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
