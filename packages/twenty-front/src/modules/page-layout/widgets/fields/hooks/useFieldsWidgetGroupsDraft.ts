import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

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
  const fieldsWidgetGroupsDraft = useAtomComponentStateValue(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const draftGroups = fieldsWidgetGroupsDraft[widgetId] ?? [];

  return { draftGroups };
};
