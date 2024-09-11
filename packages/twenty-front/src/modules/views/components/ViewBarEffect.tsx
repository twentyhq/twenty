import { isUndefined } from '@sniptt/guards';
import { useContext, useEffect, useState } from 'react';

import { useRecoilComponentValue } from '@/ui/utilities/state/instance/hooks/useRecoilComponentValue';
import { ViewEventContext } from '@/views/events/contexts/ViewEventContext';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { availableFilterDefinitionsInstanceState } from '@/views/states/availableFilterDefinitionsInstanceState';
import { isPersistingViewFieldsInstanceState } from '@/views/states/isPersistingViewFieldsInstanceState';
import { View } from '@/views/types/View';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

type ViewBarEffectProps = {
  viewBarId: string;
};

export const ViewBarEffect = ({ viewBarId }: ViewBarEffectProps) => {
  const { currentViewWithCombinedFiltersAndSorts } =
    useGetCurrentView(viewBarId);

  const { onCurrentViewChange } = useContext(ViewEventContext);

  const [currentViewSnapshot, setCurrentViewSnapshot] = useState<
    View | undefined
  >(undefined);

  const availableFilterDefinitions = useRecoilComponentValue(
    availableFilterDefinitionsInstanceState,
    viewBarId,
  );

  const isPersistingViewFields = useRecoilComponentValue(
    isPersistingViewFieldsInstanceState,
    viewBarId,
  );

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
