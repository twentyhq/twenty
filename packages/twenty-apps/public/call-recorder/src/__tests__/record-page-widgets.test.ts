import { describe, expect, it } from 'vitest';

import callParticipantsFrontComponent from 'src/front-components/call-participants.front-component';
import callRecordingsFrontComponent from 'src/front-components/call-recordings.front-component';
import callParticipantsOnCallRecordingWidget from 'src/page-layout-widgets/call-participants-on-call-recording.page-layout-widget';
import callRecordingsOnCompanyWidget from 'src/page-layout-widgets/call-recordings-on-company.page-layout-widget';
import callRecordingsOnOpportunityWidget from 'src/page-layout-widgets/call-recordings-on-opportunity.page-layout-widget';
import callRecordingsOnPersonWidget from 'src/page-layout-widgets/call-recordings-on-person.page-layout-widget';

const pageLayoutWidgets = [
  callParticipantsOnCallRecordingWidget,
  callRecordingsOnPersonWidget,
  callRecordingsOnCompanyWidget,
  callRecordingsOnOpportunityWidget,
];

describe('record page widgets', () => {
  it('pass the SDK manifest validation', () => {
    for (const definition of [
      callParticipantsFrontComponent,
      callRecordingsFrontComponent,
      ...pageLayoutWidgets,
    ]) {
      expect(definition.errors).toEqual([]);
    }
  });

  it('render rather than run headless', () => {
    expect(callParticipantsFrontComponent.config.isHeadless).not.toBe(true);
    expect(callRecordingsFrontComponent.config.isHeadless).not.toBe(true);
  });

  it('place each widget on a distinct Home tab', () => {
    const pageLayoutTabUniversalIdentifiers = pageLayoutWidgets.map(
      (widget) => widget.config.pageLayoutTabUniversalIdentifier,
    );

    expect(new Set(pageLayoutTabUniversalIdentifiers).size).toBe(
      pageLayoutWidgets.length,
    );
  });
});
