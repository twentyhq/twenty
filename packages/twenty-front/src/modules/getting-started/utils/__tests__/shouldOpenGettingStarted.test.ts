import { shouldOpenGettingStarted } from '@/getting-started/utils/shouldOpenGettingStarted';
import { GettingStartedStep } from '~/generated-metadata/graphql';

const now = new Date('2026-03-28T22:30:00Z');

describe('shouldOpenGettingStarted', () => {
  it.each([
    {
      description: 'opens with a remaining step and no snooze',
      remainingSteps: [GettingStartedStep.INSTALL_APP],
      snoozedUntil: null,
      expected: true,
    },
    {
      description: 'stays closed without a remaining step',
      remainingSteps: [],
      snoozedUntil: null,
      expected: false,
    },
    {
      description: 'stays closed while snoozed',
      remainingSteps: [GettingStartedStep.INSTALL_APP],
      snoozedUntil: '2026-03-29T00:00:00Z',
      expected: false,
    },
    {
      description: 'opens when the snooze ends now',
      remainingSteps: [GettingStartedStep.INSTALL_APP],
      snoozedUntil: now.toISOString(),
      expected: true,
    },
  ])('$description', ({ remainingSteps, snoozedUntil, expected }) => {
    expect(
      shouldOpenGettingStarted({ remainingSteps, snoozedUntil, now }),
    ).toBe(expected);
  });
});
