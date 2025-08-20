import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { compareNonEmptyStrings } from '~/utils/compareNonEmptyStrings';

export const useIsViewAnyFieldFilterDifferentFromCurrentAnyFieldFilter = () => {
  const { currentView } = useGetCurrentViewOnly();
  const anyFieldFilterValue = useRecoilComponentValue(
    anyFieldFilterValueComponentState,
  );

  const viewAnyFieldFilterValue = currentView?.anyFieldFilterValue;

  const viewAnyFieldFilterDifferentFromCurrentAnyFieldFilter =
    !compareNonEmptyStrings(viewAnyFieldFilterValue, anyFieldFilterValue);

  return { viewAnyFieldFilterDifferentFromCurrentAnyFieldFilter };
};
