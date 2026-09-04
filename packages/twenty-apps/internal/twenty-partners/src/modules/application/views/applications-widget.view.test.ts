import { describe, expect, it } from 'vitest';
import { ViewFilterOperand, ViewType } from 'twenty-sdk/define';

import {
  APPLICATION_OPPORTUNITY_FIELD_ID,
  APPLICATION_STATE_FIELD_ID,
} from 'src/modules/application/objects/application.object';

import applicationsWidgetView, {
  APPLICATIONS_WIDGET_VIEW_UNIVERSAL_IDENTIFIER,
} from './applications-widget.view';

const parseFilterValue = (value: unknown) =>
  typeof value === 'string' ? JSON.parse(value) : value;

describe('applications-widget.view', () => {
  it('keeps the existing universal identifier so sync updates in place', () => {
    expect(APPLICATIONS_WIDGET_VIEW_UNIVERSAL_IDENTIFIER).toBe(
      'cbaf92ec-c1a2-41c2-b471-cc131b060e4e',
    );
    expect(applicationsWidgetView.config.universalIdentifier).toBe(
      APPLICATIONS_WIDGET_VIEW_UNIVERSAL_IDENTIFIER,
    );
  });

  it('is a TABLE_WIDGET named for the opportunity parent', () => {
    expect(applicationsWidgetView.success).toBe(true);
    expect(applicationsWidgetView.config.type).toBe(ViewType.TABLE_WIDGET);
    expect(applicationsWidgetView.config.name).toBe(
      'Applications on Opportunity Widget',
    );
  });

  it('scopes rows with opportunity IS current record', () => {
    const filters = applicationsWidgetView.config.filters ?? [];

    expect(filters).toHaveLength(1);

    const opportunityFilter = filters[0];

    expect(opportunityFilter.fieldMetadataUniversalIdentifier).toBe(
      APPLICATION_OPPORTUNITY_FIELD_ID,
    );
    expect(opportunityFilter.operand).toBe(ViewFilterOperand.IS);
    expect(parseFilterValue(opportunityFilter.value)).toEqual({
      selectedRecordIds: [],
      isCurrentRecordSelected: true,
    });
  });

  it('does not filter by application state', () => {
    const filters = applicationsWidgetView.config.filters ?? [];

    expect(
      filters.some(
        (filter) =>
          filter.fieldMetadataUniversalIdentifier ===
          APPLICATION_STATE_FIELD_ID,
      ),
    ).toBe(false);
  });
});
