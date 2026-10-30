import { getShouldOpenGettingStarted } from '@/getting-started/utils/getShouldOpenGettingStarted';
import {
  mockGettingStartedStepDefinitions,
  mockGettingStartedStepActionKeys,
} from '~/testing/mock-data/gettingStartedSteps';

const NOW = new Date('2026-10-29T12:00:00.000Z');

const OPEN_PROGRESS = {
  steps: mockGettingStartedStepDefinitions,
  completedStepActionKeys: [],
  isHidden: false,
  snoozedUntil: null,
};

describe('getShouldOpenGettingStarted', () => {
  it.each([
    {
      description: 'opens with a remaining step and no snooze',
      progress: OPEN_PROGRESS,
      expected: true,
    },
    {
      description: 'stays closed once hidden',
      progress: { ...OPEN_PROGRESS, isHidden: true },
      expected: false,
    },
    {
      description: 'stays closed once every step is done',
      progress: {
        ...OPEN_PROGRESS,
        completedStepActionKeys: mockGettingStartedStepActionKeys,
      },
      expected: false,
    },
    {
      description: 'stays closed while snoozed',
      progress: { ...OPEN_PROGRESS, snoozedUntil: '2026-10-29T12:00:01.000Z' },
      expected: false,
    },
    {
      description: 'opens again when the snooze ends',
      progress: { ...OPEN_PROGRESS, snoozedUntil: NOW.toISOString() },
      expected: true,
    },
  ])('$description', ({ progress, expected }) => {
    expect(getShouldOpenGettingStarted({ progress, now: NOW })).toBe(expected);
  });
});
