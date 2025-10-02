import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { isNonEmptyString } from '@sniptt/guards';
import { compareNonEmptyStrings } from '~/utils/compareNonEmptyStrings';

export const useIsViewAnyFieldFilterDifferentFromCurrentAnyFieldFilter = () => {
  const { currentView } = useGetCurrentViewOnly();
  const anyFieldFilterValue = useRecoilComponentValue(
    anyFieldFilterValueComponentState,
  );

  const viewAnyFieldFilterValue = currentView?.anyFieldFilterValue;

  const viewAnyFieldFilterDifferentFromCurrentAnyFieldFilter = isNonEmptyString(
    anyFieldFilterValue,
  )
    ? !compareNonEmptyStrings(viewAnyFieldFilterValue, anyFieldFilterValue)
    : isNonEmptyString(viewAnyFieldFilterValue);

  return { viewAnyFieldFilterDifferentFromCurrentAnyFieldFilter };
};
