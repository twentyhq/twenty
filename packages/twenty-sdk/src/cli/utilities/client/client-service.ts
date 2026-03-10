import { appendFile } from 'node:fs/promises';
import { join } from 'path';

import { CLIENTS_GENERATED_DIR } from '@/cli/constants/clients-dir';
import { ApiService } from '@/cli/utilities/api/api-service';
import twentyClientTemplateSource from '@/cli/utilities/client/twenty-client-template.ts?raw';
import {
  emptyDir,
  ensureDir,
  move,
  remove,
} from '@/cli/utilities/file/fs-utils';
import { generate } from '@genql/cli';
import { DEFAULT_API_URL_NAME } from 'twenty-shared/application';

type ClientWrapperOptions = {
  apiClientName: string;
  defaultUrl: string;
  includeUploadFile: boolean;
};

const COMMON_SCALAR_TYPES = {
  DateTime: 'string',
  JSON: 'Record<string, unknown>',
  UUID: 'string',
};

const STRIPPED_TYPES_START = '// __STRIPPED_DURING_INJECTION_START__';
const STRIPPED_TYPES_END = '// __STRIPPED_DURING_INJECTION_END__';
const UPLOAD_FILE_START = '// __UPLOAD_FILE_START__';
const UPLOAD_FILE_END = '// __UPLOAD_FILE_END__';

const buildClientWrapperSource = (
  templateSource: string,
  options: ClientWrapperOptions,
): string => {
  let source = templateSource;

  source = source.replace(
    new RegExp(
      `${escapeRegExp(STRIPPED_TYPES_START)}[\\s\\S]*?${escapeRegExp(STRIPPED_TYPES_END)}\\n?`,
    ),
    '',
  );

  source = source.replace("'__TWENTY_DEFAULT_URL__'", options.defaultUrl);

  source = source.replace(/TwentyGeneratedClient/g, options.apiClientName);

  if (!options.includeUploadFile) {
    source = source.replace(
      new RegExp(
        `\\s*${escapeRegExp(UPLOAD_FILE_START)}[\\s\\S]*?${escapeRegExp(UPLOAD_FILE_END)}\\n?`,
      ),
      '\n',
    );
  } else {
    source = source.replace(
      new RegExp(`\\s*${escapeRegExp(UPLOAD_FILE_START)}\\n`),
      '\n',
    );
    source = source.replace(
      new RegExp(`\\s*${escapeRegExp(UPLOAD_FILE_END)}\\n`),
      '\n',
    );
  }

  return `\n// ${options.apiClientName} (auto-injected by twenty-sdk)\n${source}`;
};

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class ClientService {
  private apiService: ApiService;
  private clientWrapperTemplateSource: string;

  constructor(options?: {
    clientWrapperTemplateSource?: string;
    serverUrl?: string;
    token?: string;
  }) {
    this.clientWrapperTemplateSource =
      options?.clientWrapperTemplateSource ?? twentyClientTemplateSource;
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
    const generatedDir = join(
      appPath,
      'node_modules',
      'twenty-sdk',
      CLIENTS_GENERATED_DIR,
    );
    const coreOutputPath = join(generatedDir, 'core');
    const tempPath = `${coreOutputPath}.tmp`;

    const coreSchemaResponse = await this.apiService.getSchema({ authToken });

    if (!coreSchemaResponse.success) {
      throw new Error(
        `Failed to introspect core schema: ${JSON.stringify(coreSchemaResponse.error)}`,
      );
    }

    await ensureDir(tempPath);
    await emptyDir(tempPath);

    await generate({
      schema: coreSchemaResponse.data,
      output: tempPath,
      scalarTypes: COMMON_SCALAR_TYPES,
    });

    await this.injectClientWrapper(tempPath, {
      apiClientName: 'CoreApiClient',
      defaultUrl: `\`\${process.env.${DEFAULT_API_URL_NAME}}/graphql\``,
      includeUploadFile: true,
    });

    await remove(coreOutputPath);
    await move(tempPath, coreOutputPath);
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

    await ensureDir(outputPath);
    await emptyDir(outputPath);

    await generate({
      schema: metadataSchemaResponse.data,
      output: outputPath,
      scalarTypes: {
        ...COMMON_SCALAR_TYPES,
        Upload: 'File',
      },
    });

    await this.injectClientWrapper(outputPath, {
      apiClientName: 'MetadataApiClient',
      defaultUrl: `\`\${process.env.${DEFAULT_API_URL_NAME}}/metadata\``,
      includeUploadFile: true,
    });
  }

  private async injectClientWrapper(
    output: string,
    options: ClientWrapperOptions,
  ): Promise<void> {
    const clientContent = buildClientWrapperSource(
      this.clientWrapperTemplateSource,
      options,
    );

    await appendFile(join(output, 'index.ts'), clientContent);
  }
}
