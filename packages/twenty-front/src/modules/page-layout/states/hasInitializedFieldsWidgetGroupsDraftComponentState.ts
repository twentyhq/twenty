import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const hasInitializedFieldsWidgetGroupsDraftComponentState =
  createComponentState<Record<string, boolean>>({
    key: 'hasInitializedFieldsWidgetGroupsDraftComponentState',
    defaultValue: {},
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
