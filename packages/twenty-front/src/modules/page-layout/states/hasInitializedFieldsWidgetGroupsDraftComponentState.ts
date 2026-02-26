import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const hasInitializedFieldsWidgetGroupsDraftComponentState =
  createAtomComponentState<Record<string, boolean>>({
    key: 'hasInitializedFieldsWidgetGroupsDraftComponentState',
    defaultValue: {},
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
