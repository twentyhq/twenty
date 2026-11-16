/* @license Enterprise */

import { getTrialExtensionMirrorAction } from 'src/engine/core-modules/billing/utils/get-trial-extension-mirror-action.util';

const ORIGINAL_TRIAL_END = new Date('2026-12-01T00:00:00.000Z');
const EXTENDED_TRIAL_END = new Date('2026-12-15T00:00:00.000Z');
const LATER_TRIAL_END = new Date('2026-12-31T00:00:00.000Z');

describe('getTrialExtensionMirrorAction', () => {
  it('does nothing when Stripe holds the extension date already', () => {
    expect(
      getTrialExtensionMirrorAction({
        activeTrialExtensionEndsAt: EXTENDED_TRIAL_END,
        previousTrialEnd: ORIGINAL_TRIAL_END,
        isTrialing: true,
        trialEnd: new Date(EXTENDED_TRIAL_END.getTime()),
      }),
    ).toEqual({ type: 'NONE' });
  });

  it('replaces the extension when the trial is pushed further', () => {
    expect(
      getTrialExtensionMirrorAction({
        activeTrialExtensionEndsAt: EXTENDED_TRIAL_END,
        previousTrialEnd: EXTENDED_TRIAL_END,
        isTrialing: true,
        trialEnd: LATER_TRIAL_END,
      }),
    ).toEqual({ type: 'START', endsAt: LATER_TRIAL_END });
  });

  it('ends the extension when the trial is moved earlier', () => {
    expect(
      getTrialExtensionMirrorAction({
        activeTrialExtensionEndsAt: LATER_TRIAL_END,
        previousTrialEnd: LATER_TRIAL_END,
        isTrialing: true,
        trialEnd: EXTENDED_TRIAL_END,
      }),
    ).toEqual({ type: 'END' });
  });

  it('ends the extension when the trial stops before its end', () => {
    expect(
      getTrialExtensionMirrorAction({
        activeTrialExtensionEndsAt: EXTENDED_TRIAL_END,
        previousTrialEnd: EXTENDED_TRIAL_END,
        isTrialing: false,
        trialEnd: new Date('2026-11-20T00:00:00.000Z'),
      }),
    ).toEqual({ type: 'END' });
  });

  it('starts an extension when a plain trial is pushed later', () => {
    expect(
      getTrialExtensionMirrorAction({
        activeTrialExtensionEndsAt: null,
        previousTrialEnd: ORIGINAL_TRIAL_END,
        isTrialing: true,
        trialEnd: EXTENDED_TRIAL_END,
      }),
    ).toEqual({ type: 'START', endsAt: EXTENDED_TRIAL_END });
  });

  it('does nothing when a plain trial is moved earlier', () => {
    expect(
      getTrialExtensionMirrorAction({
        activeTrialExtensionEndsAt: null,
        previousTrialEnd: EXTENDED_TRIAL_END,
        isTrialing: true,
        trialEnd: ORIGINAL_TRIAL_END,
      }),
    ).toEqual({ type: 'NONE' });
  });

  it('does nothing on a subscription seen for the first time', () => {
    expect(
      getTrialExtensionMirrorAction({
        activeTrialExtensionEndsAt: null,
        previousTrialEnd: null,
        isTrialing: true,
        trialEnd: ORIGINAL_TRIAL_END,
      }),
    ).toEqual({ type: 'NONE' });
  });

  it('does nothing when a trial without extension ends', () => {
    expect(
      getTrialExtensionMirrorAction({
        activeTrialExtensionEndsAt: null,
        previousTrialEnd: ORIGINAL_TRIAL_END,
        isTrialing: false,
        trialEnd: ORIGINAL_TRIAL_END,
      }),
    ).toEqual({ type: 'NONE' });
  });
});
