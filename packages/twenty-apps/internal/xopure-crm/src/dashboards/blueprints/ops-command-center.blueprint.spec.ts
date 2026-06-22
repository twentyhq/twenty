import { describe, expect, it } from 'vitest';

import type { DashboardGraphWidgetBlueprint } from './dashboard-blueprint.type';
import { opsCommandCenterBlueprint } from './ops-command-center.blueprint';

type PieChartConfiguration = Extract<
  DashboardGraphWidgetBlueprint['configuration'],
  { configurationType: 'PIE_CHART' }
>;

const graphConfigurationFor = (widgetTitle: string): PieChartConfiguration => {
  const fulfillmentTab = opsCommandCenterBlueprint.tabs.find(
    (tab) => tab.key === 'fulfillment',
  );

  if (!fulfillmentTab) {
    throw new Error('Fulfillment tab not found');
  }

  const widget = fulfillmentTab.widgets.find(
    (candidate) =>
      candidate.type === 'GRAPH' && candidate.title === widgetTitle,
  );

  if (!widget || widget.type !== 'GRAPH') {
    throw new Error(`Graph widget not found: ${widgetTitle}`);
  }

  if (widget.configuration.configurationType !== 'PIE_CHART') {
    throw new Error(`Pie chart widget not found: ${widgetTitle}`);
  }

  return widget.configuration;
};

describe('opsCommandCenterBlueprint', () => {
  it('limits paid-but-not-fulfilled to paid order fulfillment status', () => {
    const configuration = graphConfigurationFor('Paid But Not Fulfilled');

    expect(configuration.configurationType).toBe('PIE_CHART');
    expect(configuration.groupByFieldName).toBe('fulfillmentStatus');
    expect(configuration.filter).toEqual({ status: { in: ['PAID'] } });
  });

  it('groups fulfillment status by fulfillment status field', () => {
    const configuration = graphConfigurationFor('Fulfillment Status');

    expect(configuration.configurationType).toBe('PIE_CHART');
    expect(configuration.groupByFieldName).toBe('fulfillmentStatus');
  });
});
