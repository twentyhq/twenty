import { isUndefined } from '@sniptt/guards';
import { useContext, useEffect, useState } from 'react';

import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ViewEventContext } from '@/views/events/contexts/ViewEventContext';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { availableFilterDefinitionsComponentState } from '@/views/states/availableFilterDefinitionsComponentState';
import { isPersistingViewFieldsComponentState } from '@/views/states/isPersistingViewFieldsComponentState';
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

  const availableFilterDefinitions = useRecoilComponentValueV2(
    availableFilterDefinitionsComponentState,
    viewBarId,
  );

  const isPersistingViewFields = useRecoilComponentValueV2(
    isPersistingViewFieldsComponentState,
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
