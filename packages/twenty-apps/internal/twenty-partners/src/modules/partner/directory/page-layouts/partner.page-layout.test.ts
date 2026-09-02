import { describe, expect, it } from 'vitest';

import { APPLICATIONS_ON_PARTNER_FIELD_ID } from 'src/modules/application/objects/application.object';
import { APPLICATIONS_ON_PARTNER_WIDGET_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/application/views/applications-on-partner-widget.view';
import { APPLICATIONS_WIDGET_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/application/views/applications-widget.view';

import partnerPageLayout from './partner.page-layout';

describe('partner.page-layout', () => {
  it('scopes the Briefs FIELD TABLE to the partner widget view', () => {
    const briefsWidget = partnerPageLayout.config.tabs
      .flatMap((tab) => tab.widgets ?? [])
      .find((widget) => widget.title === 'Briefs');

    expect(briefsWidget).toBeDefined();
    expect(briefsWidget?.type).toBe('FIELD');
    expect(briefsWidget?.configuration).toMatchObject({
      configurationType: 'FIELD',
      fieldMetadataId: APPLICATIONS_ON_PARTNER_FIELD_ID,
      fieldDisplayMode: 'TABLE',
      viewId: APPLICATIONS_ON_PARTNER_WIDGET_VIEW_UNIVERSAL_IDENTIFIER,
    });
    expect(
      'nestedRelationFieldMetadataId' in (briefsWidget?.configuration ?? {})
        ? briefsWidget?.configuration.nestedRelationFieldMetadataId
        : undefined,
    ).toBeUndefined();
  });

  it('does not share a view UUID with the opportunity Partners widget', () => {
    expect(APPLICATIONS_ON_PARTNER_WIDGET_VIEW_UNIVERSAL_IDENTIFIER).not.toBe(
      APPLICATIONS_WIDGET_VIEW_UNIVERSAL_IDENTIFIER,
    );
  });
});
