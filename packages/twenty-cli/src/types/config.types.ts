export interface TwentyConfig {
  apiUrl: string;
  apiKey?: string;
  defaultApp?: string;
}

export type PackageJson = {
  $schema?: string;
  universalIdentifier: string;
  name: string;
  license: string;
  description?: string;
  engines: {
    node: string;
    npm: string;
    yarn: string;
  };
  packageManager: string;
  icon?: string;
  version: string;
  dependencies?: object;
  devDependencies?: object;
};

export type AppManifest = PackageJson & {
  agents: AgentManifest[];
  objects: ObjectManifest[];
  serverlessFunctions: ServerlessFunctionManifest[];
  sources: Sources;
};

export type CoreEntityManifest =
  | AgentManifest
  | ObjectManifest
  | ServerlessFunctionManifest;

export type ServerlessFunctionManifest = {
  $schema?: string;
  universalIdentifier: string;
  name?: string;
  description?: string;
  timeoutSeconds?: number;
  triggers: ServerlessFunctionTriggerManifest[];
  code: ServerlessFunctionCodeManifest;
  handlerPath: string;
  handlerName: string;
};

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export type DatabaseEventTrigger = {
  type: 'databaseEvent';
  eventName: string;
};

export type CronTrigger = {
  type: 'cron';
  pattern: string;
};

export type RouteTrigger = {
  type: 'route';
  path: string;
  httpMethod: string;
  isAuthRequired: boolean;
};

export type ServerlessFunctionTriggerManifest =
  | CronTrigger
  | DatabaseEventTrigger
  | RouteTrigger;

type Sources = { [key: string]: string | Sources };

export type ServerlessFunctionCodeManifest = {
  src: {
    'index.ts': string;
  } & Sources;
};

export type ObjectManifest = {
  $schema?: string;
  standardId: string;
  universalIdentifier: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon?: string;
};

export type AgentManifest = {
  $schema?: string;
  standardId: string;
  universalIdentifier: string;
  name: string;
  label: string;
  description?: string;
  icon?: string;
  prompt: string;
  modelId: string;
  responseFormat?: AgentResponseFormat;
};

export interface AgentResponseFormat {
  type: 'json' | 'text';
  schema?: Record<string, unknown>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
