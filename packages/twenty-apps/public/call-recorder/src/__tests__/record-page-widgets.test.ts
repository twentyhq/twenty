import { describe, expect, it } from 'vitest';

import callParticipantsFrontComponent from 'src/front-components/call-participants.front-component';
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
});
