import { hasWidgetTooManyGroupsComponentState } from '@/page-layout/widgets/graph/states/hasWidgetTooManyGroupsComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useEffect } from 'react';

type GraphWidgetLineChartHasTooManyGroupsEffectProps = {
  hasTooManyGroups: boolean;
};

export const GraphWidgetLineChartHasTooManyGroupsEffect = ({
  hasTooManyGroups,
}: GraphWidgetLineChartHasTooManyGroupsEffectProps) => {
  const setHasWidgetTooManyGroups = useSetRecoilComponentState(
    hasWidgetTooManyGroupsComponentState,
  );

  useEffect(() => {
    setHasWidgetTooManyGroups(hasTooManyGroups);
  }, [hasTooManyGroups, setHasWidgetTooManyGroups]);

  return null;
};
