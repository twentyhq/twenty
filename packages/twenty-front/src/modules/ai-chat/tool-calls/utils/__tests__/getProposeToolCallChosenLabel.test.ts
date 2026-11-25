import { type ProposedToolCall } from 'twenty-shared/ai';

import { getProposeToolCallChosenLabel } from '@/ai-chat/tool-calls/utils/getProposeToolCallChosenLabel';

const BOOKING_PROPOSAL: ProposedToolCall = {
  toolName: 'app_tool_accept_cal_booking',
  toolLabel: 'accept-cal-booking',
  summary: 'Meeting request from Maya',
  arguments: {},
  template: 'generic',
  alternativeToolNames: ['app_tool_decline_cal_booking'],
  labels: {
    approve: 'Accept meeting',
    reject: 'Not now',
    alternatives: { app_tool_decline_cal_booking: { label: 'Decline' } },
  },
};

describe('getProposeToolCallChosenLabel', () => {
  it('names the approved tool with its own label', () => {
    expect(
      getProposeToolCallChosenLabel({
        status: 'approved',
        proposal: BOOKING_PROPOSAL,
      }),
    ).toBe('Accept meeting');
  });

  it('names an approved alternative with its label', () => {
    expect(
      getProposeToolCallChosenLabel({
        status: 'approved',
        proposal: {
          ...BOOKING_PROPOSAL,
          toolName: 'app_tool_decline_cal_booking',
        },
      }),
    ).toBe('Decline');
  });

  it('names a rejection with the reject label', () => {
    expect(
      getProposeToolCallChosenLabel({
        status: 'rejected',
        proposal: BOOKING_PROPOSAL,
      }),
    ).toBe('Not now');
  });

  it('names nothing for a call that did not end with a choice', () => {
    expect(
      getProposeToolCallChosenLabel({
        status: 'failed',
        proposal: BOOKING_PROPOSAL,
      }),
    ).toBeUndefined();
    expect(getProposeToolCallChosenLabel(undefined)).toBeUndefined();
  });
});
