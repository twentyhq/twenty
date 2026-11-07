import {
  buildDashboardFilterForWidget,
  InvalidDashboardFilterError,
  isDefined,
} from 'twenty-shared/utils';

type ComputeDashboardFilterForWidgetArgs = Parameters<
  typeof buildDashboardFilterForWidget
>[0];

export const computeDashboardFilterForWidget = (
  args: ComputeDashboardFilterForWidgetArgs,
) => {
  const boundBindings = (args.bindings ?? []).filter(({ pageLayoutFilterId }) =>
    isDefined(args.values[pageLayoutFilterId]),
  );

  const boundDashboardFilterValues = boundBindings.map(
    ({ pageLayoutFilterId }) => ({
      pageLayoutFilterId,
      conditions: args.values[pageLayoutFilterId].conditions,
    }),
  );

  try {
    return {
      boundDashboardFilterValues,
      ...buildDashboardFilterForWidget(args),
    };
  } catch (error) {
    if (!(error instanceof InvalidDashboardFilterError)) {
      throw error;
    }

    // A value that cannot be resolved must never render as an unfiltered widget
    return {
      boundDashboardFilterValues,
      recordFilters: [],
      unresolvedBindings: boundBindings,
    };
  }
};
