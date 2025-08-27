import { type StoryObj } from '@storybook/react';
import { expect, findByTestId } from '@storybook/test';
import { ProfilerDecorator } from '~/testing/decorators/ProfilerDecorator';
import { getProfilingReportFromDocument } from '~/testing/profiling/utils/getProfilingReportFromDocument';
import { isDefined } from 'twenty-shared/utils';

export const getProfilingStory = ({
  componentName,
  p95ThresholdInMs,
  averageThresholdInMs,
  numberOfRuns,
  numberOfTestsPerRun,
  warmUpRounds,
}: {
  componentName: string;
  p95ThresholdInMs?: number;
  averageThresholdInMs: number;
  numberOfRuns: number;
  numberOfTestsPerRun: number;
  warmUpRounds?: number;
}): StoryObj<any> => ({
  decorators: [ProfilerDecorator],
  parameters: {
    numberOfRuns,
    numberOfTests: numberOfTestsPerRun,
    componentName,
    warmUpRounds,
    chromatic: { disableSnapshot: true },
  },
  play: async ({ canvasElement }) => {
    await findByTestId(
      canvasElement,
      'profiling-session-finished',
      {},
      { timeout: 2 * 60000 },
    );

    const profilingReport = getProfilingReportFromDocument(canvasElement);

    if (!isDefined(profilingReport)) {
      return;
    }

    const averageResult = profilingReport?.total.average;

    expect(
      averageResult,
      `Component render time is more than average threshold (${averageThresholdInMs}ms)`,
    ).toBeLessThan(averageThresholdInMs);

    if (isDefined(p95ThresholdInMs)) {
      const p95result = profilingReport?.total.p95;

      expect(
        p95result,
        `Component render time is more than p95 threshold (${p95ThresholdInMs}ms)`,
      ).toBeLessThan(p95ThresholdInMs);
    }
  },
});
