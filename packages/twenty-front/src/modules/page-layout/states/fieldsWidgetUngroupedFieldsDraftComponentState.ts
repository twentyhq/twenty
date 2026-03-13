import { type FieldsWidgetGroupField } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const fieldsWidgetUngroupedFieldsDraftComponentState =
  createAtomComponentState<Record<string, FieldsWidgetGroupField[]>>({
    key: 'fieldsWidgetUngroupedFieldsDraftComponentState',
    defaultValue: {},
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
