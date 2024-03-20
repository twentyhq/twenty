import { useEffect, useState } from 'react';
import { isUndefined } from '@sniptt/guards';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useViewStates } from '@/views/hooks/internal/useViewStates';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { GraphQLView } from '@/views/types/GraphQLView';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isDefined } from '~/utils/isDefined';

type ViewBarEffectProps = {
  viewBarId: string;
};

export const ViewBarEffect = ({ viewBarId }: ViewBarEffectProps) => {
  const { currentViewWithCombinedFiltersAndSorts } =
    useGetCurrentView(viewBarId);
  const {
    onCurrentViewChangeState,
    currentViewIdState,
    availableFilterDefinitionsState,
    isPersistingViewFieldsState,
  } = useViewStates(viewBarId);

  const [currentViewSnapshot, setCurrentViewSnapshot] = useState<
    GraphQLView | undefined
  >(undefined);
  const onCurrentViewChange = useRecoilValue(onCurrentViewChangeState);
  const availableFilterDefinitions = useRecoilValue(
    availableFilterDefinitionsState,
  );
  const isPersistingViewFields = useRecoilValue(isPersistingViewFieldsState);
  const [currentViewId, setCurrentViewId] = useRecoilState(currentViewIdState);

  useEffect(() => {
    if (
      !isDeeplyEqual(
        currentViewWithCombinedFiltersAndSorts,
        currentViewSnapshot,
      )
    ) {
      setCurrentViewSnapshot(currentViewWithCombinedFiltersAndSorts);

      if (isUndefined(currentViewWithCombinedFiltersAndSorts)) {
        onCurrentViewChange?.(undefined);
        return;
      }

      if (!isPersistingViewFields) {
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

  useEffect(() => {
    if (
      isDefined(currentViewWithCombinedFiltersAndSorts) &&
      !isDefined(currentViewId)
    ) {
      setCurrentViewId(currentViewWithCombinedFiltersAndSorts.id);
    }
  }, [currentViewWithCombinedFiltersAndSorts, currentViewId, setCurrentViewId]);

  return <></>;
};
