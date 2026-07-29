import { describe, expect, it, vi } from 'vitest';

import { type ApiService } from '@/cli/utilities/api/api-service';
import { OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { SyncApplicationOrchestratorStep } from '@/cli/utilities/dev/orchestrator/steps/sync-application-orchestrator-step';
import { compileApplicationTranslations } from '@/cli/utilities/translations/compile-application-translations';
import { type Manifest } from 'twenty-shared/application';

vi.mock('@/cli/utilities/build/manifest/manifest-update-checksums', () => ({
  manifestUpdateChecksums: ({ manifest }: { manifest: unknown }) => manifest,
}));

vi.mock('@/cli/utilities/build/manifest/manifest-writer', () => ({
  writeManifestToOutput: vi.fn(),
}));

vi.mock(
  '@/cli/utilities/translations/compile-application-translations',
  () => ({
    compileApplicationTranslations: vi.fn().mockResolvedValue(undefined),
  }),
);

const buildStep = (
  syncApplication: ApiService['syncApplication'],
): { state: OrchestratorState; step: SyncApplicationOrchestratorStep } => {
  const state = new OrchestratorState({ appPath: '/tmp/app' });

  const apiService = { syncApplication } as unknown as ApiService;

  const step = new SyncApplicationOrchestratorStep({
    apiService,
    state,
    notify: () => {},
  });

  return { state, step };
};

const executeInput = {
  manifest: {
    application: { displayName: 'Demo' },
  } as unknown as Manifest,
  builtFileInfos: new Map(),
  appPath: '/tmp/app',
};

describe('SyncApplicationOrchestratorStep', () => {
  it('renders the applied metadata changes on a successful sync', async () => {
    const syncApplication = vi.fn().mockResolvedValue({
      success: true,
      data: {
        applicationUniversalIdentifier: 'app-uid',
        actions: [
          {
            type: 'create',
            metadataName: 'fieldMetadata',
            flatEntity: {
              universalIdentifier: 'uid-field',
              name: 'timelineActivities',
            },
          },
        ],
      },
    });

    const { state, step } = buildStep(syncApplication);

    await step.execute(executeInput);

    const messages = state.events.map((event) => event.message);

    expect(messages).toContain('Metadata changes: 1 created');
    expect(messages).toContain('  created fieldMetadata timelineActivities');
    expect(messages).toContain('✓ Synced');
  });

  it('reports no metadata changes when the sync applies nothing', async () => {
    const syncApplication = vi.fn().mockResolvedValue({
      success: true,
      data: { applicationUniversalIdentifier: 'app-uid', actions: [] },
    });

    const { state, step } = buildStep(syncApplication);

    await step.execute(executeInput);

    const messages = state.events.map((event) => event.message);

    expect(messages).toContain('No metadata changes');
    expect(messages).toContain('✓ Synced');
  });

  it('forwards compiled translations to both the plan and the apply sync', async () => {
    const compiled = {
      'fr-FR': { abc123: 'Entreprise' },
      'de-DE': { def456: 'Unternehmen' },
    };

    vi.mocked(compileApplicationTranslations).mockResolvedValueOnce(compiled);

    const syncApplication = vi.fn().mockResolvedValue({
      success: true,
      data: { applicationUniversalIdentifier: 'app-uid', actions: [] },
    });

    const { state, step } = buildStep(syncApplication);

    await step.execute(executeInput);

    expect(syncApplication).toHaveBeenCalledTimes(2);

    const [planCall, applyCall] = syncApplication.mock.calls;

    expect(planCall[0]).toMatchObject({ translations: compiled });
    expect(planCall[1]).toEqual({ dryRun: true });
    expect(applyCall[0]).toMatchObject({ translations: compiled });
    expect(applyCall[1]).toBeUndefined();

    expect(vi.mocked(compileApplicationTranslations)).toHaveBeenCalledWith(
      '/tmp/app',
    );

    expect(state.events.map((event) => event.message)).toContain('✓ Synced');
  });

  it('omits translations when compileApplicationTranslations returns undefined', async () => {
    vi.mocked(compileApplicationTranslations).mockResolvedValueOnce(undefined);

    const syncApplication = vi.fn().mockResolvedValue({
      success: true,
      data: { applicationUniversalIdentifier: 'app-uid', actions: [] },
    });

    const { step } = buildStep(syncApplication);

    await step.execute(executeInput);

    for (const call of syncApplication.mock.calls) {
      expect(call[0]).not.toHaveProperty('translations');
    }
  });
});
