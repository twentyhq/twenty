import { hasWidgetTooManyGroupsComponentState } from '@/page-layout/widgets/graph/states/hasWidgetTooManyGroupsComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useEffect } from 'react';

type GraphWidgetBarChartHasTooManyGroupsEffectProps = {
  hasTooManyGroups: boolean;
};

export const GraphWidgetBarChartHasTooManyGroupsEffect = ({
  hasTooManyGroups,
}: GraphWidgetBarChartHasTooManyGroupsEffectProps) => {
  const setHasWidgetTooManyGroups = useSetRecoilComponentState(
    hasWidgetTooManyGroupsComponentState,
  );

  useEffect(() => {
    setHasWidgetTooManyGroups(hasTooManyGroups);
  }, [hasTooManyGroups, setHasWidgetTooManyGroups]);

  return null;
};
