import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';
import { type ManifestBuildResult } from '@/cli/utilities/build/manifest/manifest-update-checksums';
import { manifestValidate } from '@/cli/utilities/build/manifest/manifest-validate';
import {
  type OrchestratorStateStepEvent,
  type OrchestratorStateStepStatus,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { type Manifest } from 'twenty-shared/application';

export type BuildManifestOrchestratorStepInput = Record<string, never>;

export type BuildManifestOrchestratorStepOutput = {
  result: ManifestBuildResult | null;
  previousObjectsFieldsFingerprint: string | null;
};

export type BuildManifestOrchestratorStepState = {
  input: BuildManifestOrchestratorStepInput;
  output: BuildManifestOrchestratorStepOutput;
  status: OrchestratorStateStepStatus;
};

export class BuildManifestOrchestratorStep {
  async execute(
    stepOutput: Readonly<BuildManifestOrchestratorStepOutput>,
    input: { appPath: string },
  ): Promise<{
    output: BuildManifestOrchestratorStepOutput;
    status: OrchestratorStateStepStatus;
    events: OrchestratorStateStepEvent[];
  }> {
    const events: OrchestratorStateStepEvent[] = [
      { message: 'Building manifest', status: 'info' },
    ];

    const result = await buildManifest(input.appPath);

    if (result.errors.length > 0 || !result.manifest) {
      for (const error of result.errors) {
        events.push({ message: error, status: 'error' });
      }

      return {
        output: { ...stepOutput, result: null },
        status: 'error',
        events,
      };
    }

    const validation = manifestValidate(result.manifest);

    if (!validation.isValid) {
      for (const validationError of validation.errors) {
        events.push({ message: validationError, status: 'error' });
      }

      return {
        output: { ...stepOutput, result: null },
        status: 'error',
        events,
      };
    }

    if (validation.warnings.length > 0) {
      for (const warning of validation.warnings) {
        events.push({ message: `⚠ ${warning}`, status: 'warning' });
      }
    }

    events.push({
      message: 'Successfully built manifest',
      status: 'success',
    });

    return {
      output: { ...stepOutput, result },
      status: 'done',
      events,
    };
  }

  hasObjectsOrFieldsChanged(
    manifest: Manifest,
    previousFingerprint: string | null,
  ): { changed: boolean; fingerprint: string } {
    const fingerprint = JSON.stringify({
      objects: manifest.objects,
      fields: manifest.fields,
    });

    return {
      changed: fingerprint !== previousFingerprint,
      fingerprint,
    };
  }
}
