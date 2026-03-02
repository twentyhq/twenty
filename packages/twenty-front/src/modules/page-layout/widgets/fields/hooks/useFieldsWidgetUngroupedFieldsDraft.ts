import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { type FieldsWidgetGroupField } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useMemo } from 'react';

type UseFieldsWidgetUngroupedFieldsDraftParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useFieldsWidgetUngroupedFieldsDraft = ({
  pageLayoutId,
  widgetId,
}: UseFieldsWidgetUngroupedFieldsDraftParams): {
  ungroupedFields: FieldsWidgetGroupField[];
} => {
  const fieldsWidgetUngroupedFieldsDraft = useAtomComponentStateValue(
    fieldsWidgetUngroupedFieldsDraftComponentState,
    pageLayoutId,
  );

  const ungroupedFields = useMemo(
    () => fieldsWidgetUngroupedFieldsDraft[widgetId] ?? [],
    [fieldsWidgetUngroupedFieldsDraft, widgetId],
  );

  return { ungroupedFields };
};
