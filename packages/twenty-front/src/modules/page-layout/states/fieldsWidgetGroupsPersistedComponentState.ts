import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const fieldsWidgetGroupsPersistedComponentState = createComponentStateV2<
  Record<string, FieldsWidgetGroup[]>
>({
  key: 'fieldsWidgetGroupsPersistedComponentState',
  defaultValue: {},
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
