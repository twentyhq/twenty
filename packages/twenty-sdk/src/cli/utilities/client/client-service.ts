import { copyFile } from 'node:fs/promises';
import { join } from 'path';

import { ApiService } from '@/cli/utilities/api/api-service';
import {
  generateCoreClientFromSchema,
  generateMetadataClient,
} from 'twenty-client-sdk/generate';

export class ClientService {
  private apiService: ApiService;

  constructor(options?: { serverUrl?: string; token?: string }) {
    this.apiService = new ApiService({
      disableInterceptors: true,
      serverUrl: options?.serverUrl,
      token: options?.token,
    });
  }

  async generateCoreClient({
    appPath,
    authToken,
  }: {
    appPath: string;
    authToken?: string;
  }): Promise<void> {
    const clientSdkRoot = join(
      appPath,
      'node_modules',
      'twenty-client-sdk',
    );
    const coreOutputPath = join(clientSdkRoot, 'dist', 'generated-core');

    const coreSchemaResponse = await this.apiService.getSchema({ authToken });

    if (!coreSchemaResponse.success) {
      throw new Error(
        `Failed to introspect core schema: ${JSON.stringify(coreSchemaResponse.error)}`,
      );
    }

    await generateCoreClientFromSchema({
      schema: coreSchemaResponse.data,
      outputPath: coreOutputPath,
    });

    // Replace the pre-built stub with the generated compiled bundles
    await copyFile(
      join(coreOutputPath, 'index.mjs'),
      join(clientSdkRoot, 'dist', 'core.mjs'),
    );
    await copyFile(
      join(coreOutputPath, 'index.cjs'),
      join(clientSdkRoot, 'dist', 'core.cjs'),
    );
  }

  async generateMetadataClient({
    outputPath,
  }: {
    outputPath: string;
  }): Promise<void> {
    const metadataSchemaResponse = await this.apiService.getMetadataSchema();

    if (!metadataSchemaResponse.success) {
      throw new Error(
        `Failed to introspect metadata schema: ${JSON.stringify(metadataSchemaResponse.error)}`,
      );
    }

    await generateMetadataClient({
      schema: metadataSchemaResponse.data,
      outputPath,
    });
  }
}
