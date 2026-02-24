import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useAtomComponentValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { isNonEmptyString } from '@sniptt/guards';
import { compareNonEmptyStrings } from '~/utils/compareNonEmptyStrings';

export const useIsViewAnyFieldFilterDifferentFromCurrentAnyFieldFilter = () => {
  const { currentView } = useGetCurrentViewOnly();
  const anyFieldFilterValue = useAtomComponentValue(
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
