import { ApiService } from '@/cli/utilities/api/api-service';
import { generate } from '@genql/cli';
import * as fs from 'fs-extra';
import { join } from 'path';
import {
  DEFAULT_API_KEY_NAME,
  DEFAULT_API_URL_NAME,
} from 'twenty-shared/application';

export class ClientService {
  private apiService: ApiService;

  constructor() {
    this.apiService = new ApiService({ disableInterceptors: true });
  }

  async generate({
    appPath,
    authToken,
  }: {
    appPath: string;
    authToken?: string;
  }): Promise<void> {
    const outputPath = this.resolveGeneratedPath(appPath);
    const tempPath = `${outputPath}.tmp`;

    const getSchemaResponse = await this.apiService.getSchema({ authToken });

    if (!getSchemaResponse.success) {
      throw new Error(
        `Failed to introspect schema: ${JSON.stringify(getSchemaResponse.error)}`,
      );
    }

    const { data: schema } = getSchemaResponse;

    await fs.ensureDir(tempPath);
    await fs.emptyDir(tempPath);

    await generate({
      schema,
      output: tempPath,
      scalarTypes: {
        DateTime: 'string',
        JSON: 'Record<string, unknown>',
        UUID: 'string',
      },
    });

    await this.injectTwentyClient(tempPath);

    await fs.remove(outputPath);
    await fs.move(tempPath, outputPath);
  }

  private resolveGeneratedPath(appPath: string): string {
    return join(appPath, 'node_modules', 'twenty-sdk', 'generated');
  }

  private async injectTwentyClient(output: string) {
    const twentyClientContent = `

// ----------------------------------------------------
// Custom Twenty client (auto-injected)
// ----------------------------------------------------

const defaultOptions: ClientOptions = {
  url: \`\${process.env.${DEFAULT_API_URL_NAME}}/graphql\`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: \`Bearer \${process.env.${DEFAULT_API_KEY_NAME}}\`,
  },
}

export default class Twenty {
  private client: Client;

  constructor(options?: ClientOptions) {
    this.client = createClient({
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options?.headers ?? {}),
      },
    });
  }

  query<R extends QueryGenqlSelection>(request: R & { __name?: string }) {
    return this.client.query(request);
  }

  mutation<R extends MutationGenqlSelection>(request: R & { __name?: string }) {
    return this.client.mutation(request);
  }
}

`;

    await fs.appendFile(join(output, 'index.ts'), twentyClientContent);
  }
}
