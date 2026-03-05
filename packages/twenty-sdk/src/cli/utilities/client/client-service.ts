import { appendFile, writeFile } from 'node:fs/promises';
import { join } from 'path';

import { ApiService } from '@/cli/utilities/api/api-service';
import {
  emptyDir,
  ensureDir,
  move,
  pathExists,
  remove,
} from '@/cli/utilities/file/fs-utils';
import twentyClientTemplateSource from '@/cli/utilities/client/twenty-client-template.ts?raw';
import { generate } from '@genql/cli';
import { DEFAULT_API_URL_NAME, GENERATED_DIR } from 'twenty-shared/application';

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

const buildClientWrapperSource = (options: ClientWrapperOptions): string => {
  let source = twentyClientTemplateSource;

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

    const [coreSchemaResponse, metadataSchemaResponse] = await Promise.all([
      this.apiService.getSchema({ authToken }),
      this.apiService.getMetadataSchema({ authToken }),
    ]);

    if (!coreSchemaResponse.success) {
      throw new Error(
        `Failed to introspect core schema: ${JSON.stringify(coreSchemaResponse.error)}`,
      );
    }

    if (!metadataSchemaResponse.success) {
      throw new Error(
        `Failed to introspect metadata schema: ${JSON.stringify(metadataSchemaResponse.error)}`,
      );
    }

    await ensureDir(tempPath);
    await emptyDir(tempPath);

    await Promise.all([
      generate({
        schema: coreSchemaResponse.data,
        output: join(tempPath, 'core'),
        scalarTypes: COMMON_SCALAR_TYPES,
      }),
      generate({
        schema: metadataSchemaResponse.data,
        output: join(tempPath, 'metadata'),
        scalarTypes: {
          ...COMMON_SCALAR_TYPES,
          Upload: 'File',
        },
      }),
    ]);

    await this.injectClientWrapper(join(tempPath, 'core'), {
      apiClientName: 'CoreApiClient',
      defaultUrl: `\`\${process.env.${DEFAULT_API_URL_NAME}}/graphql\``,
      includeUploadFile: true,
    });

    await this.injectClientWrapper(join(tempPath, 'metadata'), {
      apiClientName: 'MetadataApiClient',
      defaultUrl: `\`\${process.env.${DEFAULT_API_URL_NAME}}/metadata\``,
      includeUploadFile: true,
    });

    await this.writeBarrelIndex(tempPath);

    await remove(outputPath);
    await move(tempPath, outputPath);
  }

  async ensureGeneratedClientStub({
    appPath,
  }: {
    appPath: string;
  }): Promise<void> {
    const outputPath = this.resolveGeneratedPath(appPath);

    if (await pathExists(join(outputPath, 'index.ts'))) {
      return;
    }

    await ensureDir(join(outputPath, 'core'));
    await ensureDir(join(outputPath, 'metadata'));

    await writeFile(
      join(outputPath, 'core', 'index.ts'),
      'export class CoreApiClient {}\n',
    );
    await writeFile(
      join(outputPath, 'metadata', 'index.ts'),
      'export class MetadataApiClient {}\n',
    );
    await this.writeBarrelIndex(outputPath);
  }

  private resolveGeneratedPath(appPath: string): string {
    return join(appPath, 'node_modules', 'twenty-sdk', GENERATED_DIR);
  }

  private async writeBarrelIndex(outputDir: string): Promise<void> {
    const barrelContent = `export { CoreApiClient } from './core/index';
export { MetadataApiClient } from './metadata/index';
export * as CoreSchema from './core/schema';
export * as MetadataSchema from './metadata/schema';
`;

    await writeFile(join(outputDir, 'index.ts'), barrelContent);
  }

  private async injectClientWrapper(
    output: string,
    options: ClientWrapperOptions,
  ): Promise<void> {
    const clientContent = buildClientWrapperSource(options);

    await appendFile(join(output, 'index.ts'), clientContent);
  }
}
