import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { isNonEmptyString } from '@sniptt/guards';
import { compareNonEmptyStrings } from '~/utils/compareNonEmptyStrings';

export const useIsViewAnyFieldFilterDifferentFromCurrentAnyFieldFilter = () => {
  const { currentView } = useGetCurrentViewOnly();
  const anyFieldFilterValue = useAtomComponentStateValue(
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
