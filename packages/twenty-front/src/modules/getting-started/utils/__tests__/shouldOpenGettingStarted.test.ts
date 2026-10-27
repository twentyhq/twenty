import { shouldOpenGettingStarted } from '@/getting-started/utils/shouldOpenGettingStarted';
import { GettingStartedStep } from '~/generated-metadata/graphql';

const now = new Date('2026-03-28T22:30:00Z');

describe('shouldOpenGettingStarted', () => {
  it.each([
    {
      description: 'opens with a remaining step and no snooze',
      remainingSteps: [GettingStartedStep.INSTALL_APP],
      snoozedUntil: null,
      isHidden: false,
      expected: true,
    },
    {
      description: 'stays closed without a remaining step',
      remainingSteps: [],
      snoozedUntil: null,
      isHidden: false,
      expected: false,
    },
    {
      description: 'stays closed while snoozed',
      remainingSteps: [GettingStartedStep.INSTALL_APP],
      snoozedUntil: '2026-03-29T00:00:00Z',
      isHidden: false,
      expected: false,
    },
    {
      description: 'opens when the snooze ends now',
      remainingSteps: [GettingStartedStep.INSTALL_APP],
      snoozedUntil: now.toISOString(),
      isHidden: false,
      expected: true,
    },
    {
      description: 'stays closed once hidden for good',
      remainingSteps: [GettingStartedStep.INSTALL_APP],
      snoozedUntil: null,
      isHidden: true,
      expected: false,
    },
  ])('$description', ({ remainingSteps, snoozedUntil, isHidden, expected }) => {
    expect(
      shouldOpenGettingStarted({ remainingSteps, snoozedUntil, isHidden, now }),
    ).toBe(expected);
  });
});
