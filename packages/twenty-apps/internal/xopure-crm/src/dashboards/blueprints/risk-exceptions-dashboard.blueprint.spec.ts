import { describe, expect, it } from 'vitest';

import { riskExceptionsDashboardBlueprint } from './risk-exceptions-dashboard.blueprint';

const fieldsForView = (viewName: string): string[] => {
  for (const tab of riskExceptionsDashboardBlueprint.tabs) {
    for (const widget of tab.widgets) {
      if (widget.type === 'RECORD_TABLE' && widget.view.name === viewName) {
        return widget.view.fields.map((field) => field.fieldName);
      }
    }
  }

  throw new Error(`View not found: ${viewName}`);
};

describe('riskExceptionsDashboardBlueprint', () => {
  it('uses currency fields as primary money fields', () => {
    expect(fieldsForView('Order Review')).toEqual(
      expect.arrayContaining(['refundAmount', 'orderTotal']),
    );
    expect(fieldsForView('Order Review')).not.toEqual(
      expect.arrayContaining(['refundCents', 'totalCents']),
    );

    expect(fieldsForView('Commission Records')).toContain('amount');
    expect(fieldsForView('Commission Records')).not.toContain('amountCents');
  });
});
