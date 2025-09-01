import type { TestRunnerConfig } from '@storybook/test-runner';

const config: TestRunnerConfig = {
  tags: {
    exclude: ['no-tests'],
  },
};

export default config;
