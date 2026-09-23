import { inventoryReportSchema } from '../../schemas/inventoryReportSchema';
import { collectInventory } from '../collectInventory';
import { summarizeInventoryReport } from '../summarizeInventoryReport';

const METADATA = {
  collectedAt: '2026-09-23T00:00:00.000Z',
  playwrightVersion: '1.60.0',
  chromiumVersion: '148.0.7778.96',
  chromiumRevision: '1223',
  executablePath: '/chromium',
  platform: 'darwin',
  architecture: 'arm64',
  operatingSystemRelease: '25.6.0',
  nodeVersion: 'v24.5.0',
  commit: 'e4033db399a',
  isWorkingTreeDirty: false,
  lockfileSha256: 'lockfile',
  launch: { headless: true, args: [] },
  context: {
    viewport: { width: 1280, height: 720 },
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'light',
    deviceScaleFactor: 1,
    serviceWorkers: 'allow',
  },
  origin: 'http://127.0.0.1:4000',
  userAgent: 'Chromium',
  isSecureContext: true,
};

const createReport = () => {
  const { catalog, collection: reference } = collectInventory({
    objects: {
      globalThis: { fetch: () => true },
      window: { fetch: () => true },
      factories: {
        'rendered.div': () => ({ tagName: 'DIV' }),
        'rendered.svg': () => ({ tagName: 'svg' }),
      },
    },
    runtime: 'reference',
  });
  return inventoryReportSchema.parse({
    schemaVersion: 1,
    stage: 'inventory',
    complete: true,
    metadata: METADATA,
    catalog,
    reference,
    sandboxes: {
      react: { ...reference, runtime: 'react' },
      preact: { ...reference, runtime: 'preact' },
    },
    findings: [
      {
        scope: 'target',
        id: 'globalThis.Clipboard',
        targetId: 'globalThis.Clipboard',
        runtimes: ['react', 'preact'],
        observation: 'missing',
        reason: 'Target is absent or is not an object',
        memberCount: 3,
      },
      {
        scope: 'target',
        id: 'globalThis.Clipboard.prototype',
        targetId: 'globalThis.Clipboard.prototype',
        runtimes: ['react', 'preact'],
        observation: 'missing',
        reason: 'Target is absent or is not an object',
        memberCount: 4,
      },
      {
        scope: 'target',
        id: 'instance:pointerEvent',
        targetId: 'instance:pointerEvent',
        runtimes: ['react'],
        observation: 'uninspectable',
        reason: 'Error: constructor failed',
        memberCount: 2,
      },
      {
        scope: 'member',
        id: 'window.fetch',
        targetId: 'window',
        runtimes: ['react', 'preact'],
        observation: 'present-behavior-unverified',
        behavior: 'unverified',
        isPlacementDifferent: true,
        isDescriptorDifferent: false,
      },
      {
        scope: 'member',
        id: 'window.requestAnimationFrame',
        targetId: 'window',
        runtimes: ['preact'],
        observation: 'shape-mismatch',
        behavior: 'unverified',
        isPlacementDifferent: false,
        isDescriptorDifferent: true,
      },
    ],
  });
};

describe('summarizeInventoryReport', () => {
  it('counts target and member findings per runtime', () => {
    const summary = summarizeInventoryReport(createReport());
    expect(summary).toContain(
      '| Runtime | Absent targets | Uninspectable targets | Missing members | Shape mismatch | Present, unverified | Uninspectable members | Placement differences | Descriptor differences |',
    );
    expect(summary).toContain('| react | 2 | 1 | 0 | 0 | 1 | 0 | 1 | 0 |');
    expect(summary).toContain('| preact | 2 | 0 | 0 | 1 | 1 | 0 | 1 | 1 |');
    expect(summary).toContain('5 findings; 3 apply to every runtime.');
  });

  it('describes example members, including members of the closest absent target', () => {
    const summary = summarizeInventoryReport(createReport());
    expect(summary).toContain(
      'react: 2 absent targets group 7 catalog members, listed per target in JSON.',
    );
    expect(summary).toContain('- window.fetch: present-behavior-unverified');
    expect(summary).toContain('- window.requestAnimationFrame: shape-mismatch');
    expect(summary).toContain(
      '- globalThis.Clipboard.prototype.readText: missing (target globalThis.Clipboard.prototype)',
    );
  });
});
