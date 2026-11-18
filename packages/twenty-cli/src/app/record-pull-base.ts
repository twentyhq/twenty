import { isArray } from '@sniptt/guards';

import { fetchAppExport } from '@/app/fetch-app-export';
import { fetchWorkspaceOrThrow } from '@/app/fetch-workspace-or-throw';
import { writePullBase } from '@/app/pull/write-pull-base';
import { type ToolingBuild } from '@/app/types/tooling-result.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { CliError } from '@/output/cli-error';
import { createCancelledError } from '@/output/create-cancelled-error';
import { toCliError } from '@/output/to-cli-error';

export type PullBaseRecording = 'recorded' | 'failed' | 'unsupported';

export const recordPullBase = async ({
  appPath,
  universalIdentifier,
  sourceFingerprints,
  appliedManifest,
  context: { target, signal, output },
}: {
  appPath: string;
  universalIdentifier: string;
  sourceFingerprints?: Record<string, string>;
  appliedManifest: Pick<
    ToolingBuild['manifest'],
    'frontComponents' | 'logicFunctions'
  >;
  context: TargetCommandContext;
}): Promise<PullBaseRecording> => {
  output.progress({ message: 'Recording the pull base…' });

  try {
    if (
      !isArray(appliedManifest.frontComponents) ||
      !isArray(appliedManifest.logicFunctions)
    ) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message:
          'The applied snapshot is missing its frontend component or logic function collection.',
      });
    }
    const { id: workspaceId } = await fetchWorkspaceOrThrow({ target, signal });
    const applicationExport = await fetchAppExport({
      universalIdentifier,
      target,
      signal,
    });

    await writePullBase({
      appPath,
      manifest: {
        ...applicationExport.manifest,
        frontComponents: appliedManifest.frontComponents,
        logicFunctions: appliedManifest.logicFunctions,
      },
      target: { apiUrl: target.apiUrl, workspaceId },
      sourceFingerprints,
      signal,
    });

    return 'recorded';
  } catch (error) {
    if (signal.aborted) {
      throw createCancelledError();
    }

    const cliError = toCliError(error);

    if (cliError.code === 'APP_EXPORT_UNSUPPORTED') {
      return 'unsupported';
    }

    output.warn({
      code: 'PULL_BASE_NOT_RECORDED',
      message: `The app was applied, but its pull base was not updated: ${cliError.message} Any previous base was kept. A later pull may report changes from this apply as remote changes.`,
    });

    return 'failed';
  }
};
