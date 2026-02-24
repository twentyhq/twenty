import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { type FieldsWidgetGroupField } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
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
  const allUngroupedFields = useRecoilComponentValue(
    fieldsWidgetUngroupedFieldsDraftComponentState,
    pageLayoutId,
  );

  const ungroupedFields = useMemo(
    () => allUngroupedFields[widgetId] ?? [],
    [allUngroupedFields, widgetId],
  );

  return { ungroupedFields };
};
