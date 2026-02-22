import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useMemo } from 'react';

type UseFieldsWidgetGroupsDraftParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useFieldsWidgetGroupsDraft = ({
  pageLayoutId,
  widgetId,
}: UseFieldsWidgetGroupsDraftParams): {
  draftGroups: FieldsWidgetGroup[];
} => {
  const allDraftGroups = useRecoilComponentValue(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const draftGroups = useMemo(
    () => allDraftGroups[widgetId] ?? [],
    [allDraftGroups, widgetId],
  );

  return { draftGroups };
};
