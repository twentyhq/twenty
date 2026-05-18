export const APP_FACTORY_FIELD_TYPES = [
  'TEXT',
  'NUMBER',
  'BOOLEAN',
  'DATE_TIME',
  'EMAILS',
  'PHONES',
  'LINKS',
  'FULL_NAME',
  'ADDRESS',
  'SELECT',
  'MULTI_SELECT',
  'RATING',
  'CURRENCY',
  'UUID',
] as const;

export type AppFactoryFieldType = (typeof APP_FACTORY_FIELD_TYPES)[number];

export type AppFactoryHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type AppFactorySelectOptionSpec = {
  id: string;
  value: string;
  label: string;
  color?: string;
  position?: number;
};

export type AppFactoryObjectFieldSpec = {
  universalIdentifier: string;
  name: string;
  label: string;
  type: AppFactoryFieldType;
  icon: string;
  description?: string;
  isNullable?: boolean;
  defaultValue?: string | number | boolean | null;
  options?: AppFactorySelectOptionSpec[];
};

export type AppFactoryObjectSpec = {
  fileName?: string;
  universalIdentifier: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon: string;
  labelIdentifierFieldMetadataUniversalIdentifier?: string;
  fields: AppFactoryObjectFieldSpec[];
};

export type AppFactoryRouteTriggerSpec = {
  path: string;
  httpMethod: AppFactoryHttpMethod;
  isAuthRequired?: boolean;
  forwardedRequestHeaders?: string[];
};

export type AppFactoryLogicFunctionSpec = {
  fileName?: string;
  universalIdentifier: string;
  name: string;
  description: string;
  timeoutSeconds?: number;
  handlerBody?: string;
  routeTrigger?: AppFactoryRouteTriggerSpec;
};

export type AppFactoryGenerationSpec = {
  objects: AppFactoryObjectSpec[];
  logicFunctions: AppFactoryLogicFunctionSpec[];
};

export type AppFactoryAppMetadataSpec = {
  directory: string;
  name: string;
  displayName: string;
  description: string;
  example?: string;
  skipLocalInstance?: boolean;
};

export type AppFactoryPostInstallExecSpec = {
  payload?: string;
  functionName?: string;
  functionUniversalIdentifier?: string;
  preInstall?: boolean;
};

export type AppFactoryPipelineOptionsSpec = {
  installDependencies?: boolean;
  buildTarball?: boolean;
  deploy?: boolean;
  install?: boolean;
  remote?: string;
  postInstall?: AppFactoryPostInstallExecSpec;
  dryRun?: boolean;
};

export type AppFactorySpec = {
  app: AppFactoryAppMetadataSpec;
  generation: AppFactoryGenerationSpec;
  pipeline?: AppFactoryPipelineOptionsSpec;
};

export type NormalizedAppFactoryAppMetadata = Omit<
  AppFactoryAppMetadataSpec,
  'skipLocalInstance'
> & {
  skipLocalInstance: boolean;
};

export type NormalizedAppFactoryPostInstallExec = {
  payload: string;
  functionName?: string;
  functionUniversalIdentifier?: string;
  preInstall: boolean;
};

export type NormalizedAppFactoryPipelineOptions = {
  installDependencies: boolean;
  buildTarball: boolean;
  deploy: boolean;
  install: boolean;
  remote?: string;
  postInstall?: NormalizedAppFactoryPostInstallExec;
  dryRun: boolean;
};

export type NormalizedAppFactorySpec = {
  app: NormalizedAppFactoryAppMetadata;
  generation: AppFactoryGenerationSpec;
  pipeline: NormalizedAppFactoryPipelineOptions;
};

export type AppFactoryValidationResult =
  | {
      success: true;
      spec: NormalizedAppFactorySpec;
    }
  | {
      success: false;
      errors: string[];
    };

export type AppFactoryGeneratedFile = {
  path: string;
  content: string;
};

export type AppFactoryGeneratorResult = {
  files: AppFactoryGeneratedFile[];
};

export type AppFactoryCommandExecution = {
  command: string;
  args: string[];
  cwd: string;
  dryRun: boolean;
  skipped: boolean;
  success: boolean;
  exitCode: number | null;
  stdout: string;
  stderr: string;
};

export const APP_FACTORY_PIPELINE_STAGE_NAMES = [
  'validateSpec',
  'scaffold',
  'generateFiles',
  'installDependencies',
  'buildTarball',
  'deploy',
  'install',
  'postInstallExec',
] as const;

export type AppFactoryPipelineStageName =
  (typeof APP_FACTORY_PIPELINE_STAGE_NAMES)[number];

export type AppFactoryPipelineStageStatus = {
  name: AppFactoryPipelineStageName;
  success: boolean;
  skipped: boolean;
  details?: string;
};

export type AppFactoryPipelineResult = {
  success: boolean;
  appDirectory: string;
  generatedFiles: string[];
  commands: AppFactoryCommandExecution[];
  stages: AppFactoryPipelineStageStatus[];
  errors: string[];
};
