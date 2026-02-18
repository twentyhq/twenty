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

    const getSchemaResponse = await this.apiService.getSchema({ authToken });

    if (!getSchemaResponse.success) {
      throw new Error(
        `Failed to introspect schema: ${JSON.stringify(getSchemaResponse.error)}`,
      );
    }

    const { data: schema } = getSchemaResponse;

    await fs.ensureDir(outputPath);
    await fs.emptyDir(outputPath);

    await generate({
      schema,
      output: outputPath,
      scalarTypes: {
        DateTime: 'string',
        JSON: 'Record<string, unknown>',
        UUID: 'string',
      },
    });

    await this.injectTwentyClient(outputPath);
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
  private apiUrl: string;
  private authorizationToken: string;

  constructor(options?: ClientOptions) {
    const merged: ClientOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options?.headers ?? {}),
      },
    };

    this.client = createClient(merged);
    this.apiUrl = merged.url;
    this.authorizationToken = merged.headers.Authorization;
  }

  query<R extends QueryGenqlSelection>(request: R & { __name?: string }) {
    return this.client.query(request);
  }

  mutation<R extends MutationGenqlSelection>(request: R & { __name?: string }) {
    return this.client.mutation(request);
  }

  async uploadFile(
    fileBuffer: Buffer,
    filename: string,
    contentType: string = 'application/octet-stream',
    fileFolder: string = 'Attachment',
  ): Promise<{ path: string; token: string }> {
    const form = new FormData();

    form.append('operations', JSON.stringify({
      query: \`mutation UploadFile($file: Upload!, $fileFolder: FileFolder) {
        uploadFile(file: $file, fileFolder: $fileFolder) { path token }
      }\`,
      variables: { file: null, fileFolder },
    }));
    form.append('map', JSON.stringify({ '0': ['variables.file'] }));
    form.append('0', new Blob([fileBuffer], { type: contentType }), filename);


    const response = await fetch(\`\${this.apiUrl}/graphql\`, {
      method: 'POST',
      headers: {
        Authorization: this.authorizationToken,
      },
      body: form,
    });

    const result = await response.json();

    if (result.errors) {
      throw new GenqlError(result.errors, result.data);
    }

    return result.data.uploadFile;
  }
}

`;

    await fs.appendFile(join(output, 'index.ts'), twentyClientContent);
  }
}
