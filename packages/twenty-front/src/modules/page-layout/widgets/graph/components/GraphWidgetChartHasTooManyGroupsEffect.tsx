import { hasWidgetTooManyGroupsComponentState } from '@/page-layout/widgets/graph/states/hasWidgetTooManyGroupsComponentState';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilComponentStateV2';
import { useEffect } from 'react';

type GraphWidgetChartHasTooManyGroupsEffectProps = {
  hasTooManyGroups: boolean;
};

export const GraphWidgetChartHasTooManyGroupsEffect = ({
  hasTooManyGroups,
}: GraphWidgetChartHasTooManyGroupsEffectProps) => {
  const setHasWidgetTooManyGroups = useSetRecoilComponentStateV2(
    hasWidgetTooManyGroupsComponentState,
  );

  useEffect(() => {
    setHasWidgetTooManyGroups(hasTooManyGroups);
  }, [hasTooManyGroups, setHasWidgetTooManyGroups]);

  return null;
};
