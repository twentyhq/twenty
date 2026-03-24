import { join } from 'path';

import { ApiService } from '@/cli/utilities/api/api-service';
import { replaceCoreClient } from 'twenty-client-sdk/generate';

export class ClientService {
  private apiService: ApiService;

  constructor(options?: {
    serverUrl?: string;
    token?: string;
    skipAuth?: boolean;
  }) {
    this.apiService = new ApiService({
      disableInterceptors: true,
      serverUrl: options?.serverUrl,
      skipAuth: true,
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
    const coreSchemaResponse = await this.apiService.getSchema({ authToken });

    if (!coreSchemaResponse.success) {
      throw new Error(
        `Failed to introspect core schema: ${JSON.stringify(coreSchemaResponse.error)}`,
      );
    }

    await replaceCoreClient({
      packageRoot: join(appPath, 'node_modules', 'twenty-client-sdk'),
      schema: coreSchemaResponse.data,
    });
  }
}
