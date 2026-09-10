import { describe, expect, it } from 'vitest';

import { APPLICATIONS_ON_OPPORTUNITY_FIELD_ID } from 'src/modules/application/objects/application.object';
import { APPLICATIONS_WIDGET_VIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/application/views/applications-widget.view';

import opportunityPageLayout from './opportunity.page-layout';

describe('opportunity.page-layout', () => {
  it('scopes the Partners FIELD TABLE to the opportunity widget view', () => {
    const partnersWidget = opportunityPageLayout.config.tabs
      .flatMap((tab) => tab.widgets ?? [])
      .find((widget) => widget.title === 'Partners');

    expect(partnersWidget).toBeDefined();
    expect(partnersWidget?.type).toBe('FIELD');
    expect(partnersWidget?.configuration).toMatchObject({
      configurationType: 'FIELD',
      fieldMetadataId: APPLICATIONS_ON_OPPORTUNITY_FIELD_ID,
      fieldDisplayMode: 'TABLE',
      viewId: APPLICATIONS_WIDGET_VIEW_UNIVERSAL_IDENTIFIER,
    });
    expect(
      'nestedRelationFieldMetadataId' in (partnersWidget?.configuration ?? {})
        ? partnersWidget?.configuration.nestedRelationFieldMetadataId
        : undefined,
    ).toBeUndefined();
  });
});
