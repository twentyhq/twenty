import { describe, expect, it } from 'vitest';

import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { CALL_PARTICIPANTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import callParticipantsFrontComponent from 'src/front-components/call-participants.front-component';
import callParticipantsOnCallRecordingPageLayoutWidget from 'src/page-layout-widgets/call-participants-on-call-recording.page-layout-widget';
import callRecordingsFrontComponent from 'src/front-components/call-recordings.front-component';

const recordPageWidgetFrontComponents = [
  callParticipantsFrontComponent,
  callRecordingsFrontComponent,
];

describe('record page widgets', () => {
  it('pass the SDK manifest validation', () => {
    for (const frontComponent of recordPageWidgetFrontComponents) {
      expect(frontComponent.errors).toEqual([]);
    }
  });

  // Users add these from the layout editor, which only offers rendered
  // (non-headless) front components as widgets.
  it('can be placed as widgets', () => {
    for (const frontComponent of recordPageWidgetFrontComponents) {
      expect(frontComponent.config.isHeadless).not.toBe(true);
    }
  });

  it('adds call participants to the call recording Home tab', () => {
    expect(callParticipantsOnCallRecordingPageLayoutWidget.errors).toEqual([]);
    expect(
      callParticipantsOnCallRecordingPageLayoutWidget.config,
    ).toMatchObject({
      pageLayoutTabUniversalIdentifier:
        STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.callRecordingRecordPage.tabs
          .home.universalIdentifier,
      configuration: {
        frontComponentUniversalIdentifier:
          CALL_PARTICIPANTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
      },
    });
  });
});
