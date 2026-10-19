import { isNonEmptyString } from '@sniptt/guards';
import { openAsBlob } from 'node:fs';
import { stat } from 'node:fs/promises';
import { basename } from 'node:path';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { putUploadFile } from '@/app/deployment/put-upload-file';
import { withPhaseDetails } from '@/app/deployment/with-phase-details';
import { type PackedApp } from '@/app/publish/types/packed-app.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { CliError } from '@/output/cli-error';
import { toCliError } from '@/output/to-cli-error';
import { toPublicTarget } from '@/target/to-public-target';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

type PrivatePublishPhase = 'prepare-upload' | 'upload' | 'register';

export const publishAppToServer = async ({
  packedApp,
  context: { target, signal, output },
}: {
  packedApp: PackedApp;
  context: Pick<TargetCommandContext, 'target' | 'signal' | 'output'>;
}) => {
  let phase: PrivatePublishPhase = 'prepare-upload';
  const completedPhases: PrivatePublishPhase[] = [];
  let fileId: string | undefined;

  try {
    signal.throwIfAborted();
    const { size } = await stat(packedApp.path);
    const client = createMetadataClient({ target, signal });
    const data = await client.mutation({
      __name: 'CreateAppTarballUpload',
      createFileUpload: {
        __args: {
          filename: basename(packedApp.path),
          size,
          fileFolder: 'AppTarball',
        },
        fileId: true,
        uploadUrl: true,
        contentType: true,
      },
    });
    const upload = data.createFileUpload;

    if (
      !isPlainObject(upload) ||
      !isNonEmptyString(upload.fileId) ||
      !isNonEmptyString(upload.uploadUrl) ||
      !isNonEmptyString(upload.contentType)
    ) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message: 'The server returned an invalid tarball upload target.',
      });
    }

    fileId = upload.fileId;
    completedPhases.push(phase);
    phase = 'upload';
    output.progress({
      message: `Uploading ${packedApp.name}@${packedApp.version} to ${target.apiUrl}…`,
    });
    const status = await putUploadFile({
      uploadUrl: upload.uploadUrl,
      contentType: upload.contentType,
      bytes: await openAsBlob(packedApp.path),
      signal,
    });

    if (status < 200 || status >= 300) {
      throw new CliError({
        code: 'UPLOAD_FAILED',
        message: `File storage answered ${status}.`,
      });
    }

    completedPhases.push(phase);
    signal.throwIfAborted();
    output.progress({ message: 'Registering the uploaded app…' });
    phase = 'register';
    const result = await client.mutation({
      __name: 'CompleteAppTarballUpload',
      completeAppTarballUpload: {
        __args: { fileId },
        id: true,
        name: true,
        universalIdentifier: true,
      },
    });
    const registration = result.completeAppTarballUpload;

    if (
      !isPlainObject(registration) ||
      !isNonEmptyString(registration.id) ||
      !isNonEmptyString(registration.name) ||
      !isNonEmptyString(registration.universalIdentifier)
    ) {
      throw new CliError({
        code: 'INVALID_RESPONSE',
        message: 'The server did not return the published app registration.',
      });
    }

    completedPhases.push(phase);

    return {
      target: 'private',
      registry: toPublicTarget(target),
      name: packedApp.name,
      version: packedApp.version,
      registration,
      fileId,
      installed: false,
    };
  } catch (error) {
    const failure = withPhaseDetails({
      error: toCliError(error, signal),
      phase,
      completedPhases,
      outcome: phase === 'register' ? 'unknown' : 'not-published',
      hint:
        phase === 'register'
          ? 'The app may already be registered. Check the server registry before retrying; publishing does not install the app.'
          : 'Fix the problem, then run twenty app publish --private again to create a fresh upload.',
    });

    throw new CliError({
      cause: failure,
      code: failure.code,
      exitCode: failure.exitCode,
      message: failure.message,
      hint: failure.hint,
      details: {
        ...failure.details,
        ...(isDefined(fileId) ? { fileId } : {}),
        registry: toPublicTarget(target),
      },
    });
  }
};
