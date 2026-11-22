import { randomBytes } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { gunzipSync } from 'zlib';

import { replaceCoreClient } from 'twenty-client-sdk/generate';

import {
  SDK_CLIENT_GENERATION_WORK_ROOT,
  SDK_CLIENT_GENERATOR_LAMBDA_MAX_ARCHIVE_BYTES,
  SDK_CLIENT_PACKAGE_TEMPLATE_DIRNAME_IN_FUNCTION,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/sdk-client-generation-lambda.constant';
import {
  type SdkClientGenerationLambdaPayload,
  type SdkClientGenerationLambdaResult,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/sdk-client-generation-lambda.type';
import { createZipFile } from 'src/engine/core-modules/logic-function/logic-function-drivers/utils/create-zip-file';

export const handler = async ({
  gzippedSchema,
}: SdkClientGenerationLambdaPayload): Promise<SdkClientGenerationLambdaResult> => {
  // A warm environment serves later calls from any workspace, and a killed call
  // skips its own cleanup.
  await fs.rm(SDK_CLIENT_GENERATION_WORK_ROOT, {
    recursive: true,
    force: true,
  });

  const workDirectory = join(
    SDK_CLIENT_GENERATION_WORK_ROOT,
    randomBytes(16).toString('hex'),
  );
  const packageRoot = join(
    workDirectory,
    SDK_CLIENT_PACKAGE_TEMPLATE_DIRNAME_IN_FUNCTION,
  );
  const archivePath = join(workDirectory, 'twenty-client-sdk.zip');

  try {
    await fs.mkdir(workDirectory, { recursive: true });
    await fs.cp(
      join(__dirname, SDK_CLIENT_PACKAGE_TEMPLATE_DIRNAME_IN_FUNCTION),
      packageRoot,
      { recursive: true },
    );

    await replaceCoreClient({
      packageRoot,
      schema: gunzipSync(Buffer.from(gzippedSchema, 'base64')).toString(
        'utf-8',
      ),
    });

    await createZipFile(packageRoot, archivePath);

    const archive = await fs.readFile(archivePath);

    if (archive.length > SDK_CLIENT_GENERATOR_LAMBDA_MAX_ARCHIVE_BYTES) {
      return { success: false, errorCode: 'ARCHIVE_TOO_LARGE' };
    }

    return { success: true, archive: archive.toString('base64') };
  } catch (error) {
    // Only the error code goes back to the server: build errors can quote input.
    // oxlint-disable-next-line no-console
    console.error(error);

    return { success: false, errorCode: 'GENERATION_FAILED' };
  } finally {
    await fs.rm(workDirectory, { recursive: true, force: true });
  }
};
