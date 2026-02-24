import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const fieldsWidgetGroupsDraftComponentState = createComponentState<
  Record<string, FieldsWidgetGroup[]>
>({
  key: 'fieldsWidgetGroupsDraftComponentState',
  defaultValue: {},
  componentInstanceContext: PageLayoutComponentInstanceContext,
});
