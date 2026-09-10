import { describe, expect, it } from 'vitest';
import { ViewFilterOperand, ViewType } from 'twenty-sdk/define';

import {
  APPLICATION_PARTNER_FIELD_ID,
  APPLICATION_STATE_FIELD_ID,
} from 'src/modules/application/objects/application.object';
import { APPLICATIONS_WIDGET_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/application/views/applications-widget.view';

import applicationsOnPartnerWidgetView, {
  APPLICATIONS_ON_PARTNER_WIDGET_VIEW_UNIVERSAL_IDENTIFIER,
} from './applications-on-partner-widget.view';

const parseFilterValue = (value: unknown) =>
  typeof value === 'string' ? JSON.parse(value) : value;

describe('applications-on-partner-widget.view', () => {
  it('uses a stable UUID distinct from the opportunity widget view', () => {
    expect(APPLICATIONS_ON_PARTNER_WIDGET_VIEW_UNIVERSAL_IDENTIFIER).toBe(
      '22d162c7-404a-4f09-92c9-790d3c33a733',
    );
    expect(applicationsOnPartnerWidgetView.config.universalIdentifier).toBe(
      APPLICATIONS_ON_PARTNER_WIDGET_VIEW_UNIVERSAL_IDENTIFIER,
    );
    expect(APPLICATIONS_ON_PARTNER_WIDGET_VIEW_UNIVERSAL_IDENTIFIER).not.toBe(
      APPLICATIONS_WIDGET_VIEW_UNIVERSAL_IDENTIFIER,
    );
  });

  it('is a TABLE_WIDGET named for the partner parent', () => {
    expect(applicationsOnPartnerWidgetView.success).toBe(true);
    expect(applicationsOnPartnerWidgetView.config.type).toBe(
      ViewType.TABLE_WIDGET,
    );
    expect(applicationsOnPartnerWidgetView.config.name).toBe(
      'Applications on Partner Widget',
    );
  });

  it('scopes rows with partner IS current record', () => {
    const filters = applicationsOnPartnerWidgetView.config.filters ?? [];

    expect(filters).toHaveLength(1);

    const partnerFilter = filters[0];

    expect(partnerFilter.fieldMetadataUniversalIdentifier).toBe(
      APPLICATION_PARTNER_FIELD_ID,
    );
    expect(partnerFilter.operand).toBe(ViewFilterOperand.IS);
    expect(parseFilterValue(partnerFilter.value)).toEqual({
      selectedRecordIds: [],
      isCurrentRecordSelected: true,
    });
  });

  it('does not filter by application state', () => {
    const filters = applicationsOnPartnerWidgetView.config.filters ?? [];

    expect(
      filters.some(
        (filter) =>
          filter.fieldMetadataUniversalIdentifier ===
          APPLICATION_STATE_FIELD_ID,
      ),
    ).toBe(false);
  });
});
