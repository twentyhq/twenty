import { useEffect, useState } from 'react';
import { isUndefined } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';

import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { View } from '@/views/types/View';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type ViewBarEffectProps = {
  viewBarId: string;
};

export const ViewBarEffect = ({ viewBarId }: ViewBarEffectProps) => {
  const { currentViewWithCombinedFiltersAndSorts } =
    useGetCurrentView(viewBarId);
  const {
    onCurrentViewChangeState,
    availableFilterDefinitionsState,
    isPersistingViewFieldsState,
  } = useViewStates(viewBarId);

  const [currentViewSnapshot, setCurrentViewSnapshot] = useState<
    View | undefined
  >(undefined);

  const onCurrentViewChange = useRecoilValue(onCurrentViewChangeState);
  const availableFilterDefinitions = useRecoilValue(
    availableFilterDefinitionsState,
  );
  const isPersistingViewFields = useRecoilValue(isPersistingViewFieldsState);

  useEffect(() => {
    if (
      !isDeeplyEqual(
        currentViewWithCombinedFiltersAndSorts,
        currentViewSnapshot,
      )
    ) {
      if (isUndefined(currentViewWithCombinedFiltersAndSorts)) {
        setCurrentViewSnapshot(currentViewWithCombinedFiltersAndSorts);
        onCurrentViewChange?.(undefined);
        return;
      }

      if (!isPersistingViewFields) {
        setCurrentViewSnapshot(currentViewWithCombinedFiltersAndSorts);
        onCurrentViewChange?.(currentViewWithCombinedFiltersAndSorts);
      }
    }
  }, [
    availableFilterDefinitions,
    currentViewSnapshot,
    currentViewWithCombinedFiltersAndSorts,
    isPersistingViewFields,
    onCurrentViewChange,
  ]);

  return <></>;
};
