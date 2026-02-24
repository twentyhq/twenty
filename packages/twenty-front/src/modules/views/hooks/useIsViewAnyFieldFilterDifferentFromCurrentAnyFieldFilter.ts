import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { isNonEmptyString } from '@sniptt/guards';
import { compareNonEmptyStrings } from '~/utils/compareNonEmptyStrings';

export const useIsViewAnyFieldFilterDifferentFromCurrentAnyFieldFilter = () => {
  const { currentView } = useGetCurrentViewOnly();
  const anyFieldFilterValue = useRecoilComponentValueV2(
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
