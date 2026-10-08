import { join } from 'path';

import { ApiService } from '@/cli/utilities/api/api-service';
import { replaceCoreClient } from 'twenty-client-sdk/generate';

export class ClientService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService({ disableInterceptors: true });
  }

  async generateCoreClient({
    appPath,
    applicationUniversalIdentifier,
  }: {
    appPath: string;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    const coreSchemaResponse =
      await this.apiService.getApplicationCoreGraphqlSchema(
        applicationUniversalIdentifier,
      );

    if (!coreSchemaResponse.success) {
      throw new Error(
        `Failed to load the application schema: ${JSON.stringify(coreSchemaResponse.error)}`,
      );
    }

    await replaceCoreClient({
      packageRoot: join(appPath, 'node_modules', 'twenty-client-sdk'),
      schema: coreSchemaResponse.data,
    });
  }
}
