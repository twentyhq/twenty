import { fetchAppExport } from '@/app/fetch-app-export';
import { fetchWorkspaceId } from '@/app/fetch-workspace-id';
import { writePullBase } from '@/app/pull/write-pull-base';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { createCancelledError } from '@/output/create-cancelled-error';
import { toCliError } from '@/output/to-cli-error';

export type PullBaseRecording = 'recorded' | 'failed' | 'unsupported';

export const recordPullBase = async ({
  appPath,
  universalIdentifier,
  sourceFingerprints,
  context: { target, signal, output },
}: {
  appPath: string;
  universalIdentifier: string;
  sourceFingerprints?: Record<string, string>;
  context: TargetCommandContext;
}): Promise<PullBaseRecording> => {
  output.progress('Recording the pull base…');

  try {
    const workspaceId = await fetchWorkspaceId({ target, signal });
    const applicationExport = await fetchAppExport({
      universalIdentifier,
      target,
      signal,
    });

    await writePullBase({
      appPath,
      manifest: applicationExport.manifest,
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
