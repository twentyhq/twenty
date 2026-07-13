import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';

import { runFrontComponentSandboxIsolationProbe } from '@/__stories__/utils/runFrontComponentSandboxIsolationProbe';

const meta: Meta = {
  title: 'FrontComponent/Security',
  render: () => <div data-testid="front-component-sandbox-isolation" />,
};

export default meta;
type Story = StoryObj;

export const WorkerRunsInOpaqueOriginWithoutStorageAccess: Story = {
  play: async () => {
    const report = await runFrontComponentSandboxIsolationProbe();

    expect(report.iframeOrigin).toBe('null');
    expect(report.workerOrigin).toBe('null');
    expect(report.localStorageDenied).toBe(true);
    expect(report.cookiesDenied).toBe(true);
    expect(report.indexedDbDenied).toBe(true);
    expect(report.workerIndexedDbDenied).toBe(true);
  },
};
