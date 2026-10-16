import { describe, expect, it } from 'vitest';

import { STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { CALL_PARTICIPANTS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import callParticipantsFrontComponent from 'src/front-components/call-participants.front-component';
import callParticipantsOnCallRecordingPageLayoutWidget from 'src/page-layout-widgets/call-participants-on-call-recording.page-layout-widget';

describe('record page widgets', () => {
  it('passes the SDK manifest validation', () => {
    expect(callParticipantsFrontComponent.errors).toEqual([]);
  });

  it('can be placed as a widget', () => {
    expect(callParticipantsFrontComponent.config.isHeadless).not.toBe(true);
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
