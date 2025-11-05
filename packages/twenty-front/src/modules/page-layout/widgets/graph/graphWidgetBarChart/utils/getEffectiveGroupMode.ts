import { type BarChartConfiguration } from '~/generated/graphql';

export const getEffectiveGroupMode = (
  groupMode: BarChartConfiguration['groupMode'],
  hasGroupByOnSecondaryAxis: boolean,
): 'grouped' | 'stacked' | undefined => {
  if (!hasGroupByOnSecondaryAxis) {
    return undefined;
  }

  if (groupMode === 'GROUPED') {
    return 'grouped';
  }

  return 'stacked';
};
