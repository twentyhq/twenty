import { type FieldsWidgetEditorMode } from '@/page-layout/widgets/fields/types/FieldsWidgetEditorMode';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const fieldsWidgetEditorModeDraftComponentState =
  createAtomComponentState<Record<string, FieldsWidgetEditorMode>>({
    key: 'fieldsWidgetEditorModeDraftComponentState',
    defaultValue: {},
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
