import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const fieldsWidgetGroupsDraftComponentState = createComponentState<
  Record<string, FieldsWidgetGroup[]>
>({
  key: 'fieldsWidgetGroupsDraftComponentState',
  defaultValue: {},
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
