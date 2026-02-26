import { hasWidgetTooManyGroupsComponentState } from '@/page-layout/widgets/graph/states/hasWidgetTooManyGroupsComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useEffect } from 'react';

type GraphWidgetChartHasTooManyGroupsEffectProps = {
  hasTooManyGroups: boolean;
};

export const GraphWidgetChartHasTooManyGroupsEffect = ({
  hasTooManyGroups,
}: GraphWidgetChartHasTooManyGroupsEffectProps) => {
  const setHasWidgetTooManyGroups = useSetAtomComponentState(
    hasWidgetTooManyGroupsComponentState,
  );

  useEffect(() => {
    setHasWidgetTooManyGroups(hasTooManyGroups);
  }, [hasTooManyGroups, setHasWidgetTooManyGroups]);

  return null;
};
