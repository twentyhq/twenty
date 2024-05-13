import { StoryObj } from '@storybook/react';
import { expect, findByTestId } from '@storybook/test';

import { ProfilerDecorator } from '~/testing/decorators/ProfilerDecorator';
import { getProfilingReportFromDocument } from '~/testing/profiling/utils/getProfilingReportFromDocument';
import { isDefined } from '~/utils/isDefined';

export const getProfilingStory = (
  componentName: string,
  p95ThresholdInMs: number,
  numberOfRuns: number,
  numberOfTestsPerRun: number,
): StoryObj<any> => ({
  decorators: [ProfilerDecorator],
  parameters: {
    numberOfRuns,
    numberOfTests: numberOfTestsPerRun,
    componentName,
  },
  play: async ({ canvasElement }) => {
    await new Promise((resolve) => setTimeout(resolve, 30000));

    await findByTestId(
      canvasElement,
      'profiling-session-finished',
      {},
      { timeout: 60000 },
    );

    const profilingReport = getProfilingReportFromDocument(canvasElement);

    if (!isDefined(profilingReport)) {
      return;
    }

    const p95result = profilingReport?.total.p95;

    // eslint-disable-next-line no-console
    console.log({
      profilingReport,
    });

    expect(
      p95result,
      `Component render time is more than p95 threshold (${p95ThresholdInMs}ms)`,
    ).toBeLessThan(p95ThresholdInMs);
  },
});
