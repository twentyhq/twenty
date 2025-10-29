export interface TwentyConfig {
  apiUrl: string;
  apiKey?: string;
  defaultApp?: string;
}

export type PackageJson = {
  name: string;
  license: string;
  engines: {
    node: string;
    npm: string;
    yarn: string;
  };
  packageManager: string;
  version: string;
  dependencies?: object;
  devDependencies?: object;
};

export type ApplicationManifest = {
  universalIdentifier: string;
  displayName: string;
  description?: string;
  icon?: string;
};

export type AppManifest = {
  application: ApplicationManifest;
  objects: ObjectManifest[];
  serverlessFunctions: ServerlessFunctionManifest[];
  applicationVariables: ApplicationVariableManifest[];
  sources: Sources;
};

export type ApplicationVariableManifest = {
  universalIdentifier: string;
  key: string;
  description?: string;
  isSecret?: boolean;
  value?: string;
};

export type ServerlessFunctionManifest = {
  $schema?: string;
  universalIdentifier: string;
  name?: string;
  description?: string;
  timeoutSeconds?: number;
  triggers: ServerlessFunctionTriggerManifest[];
  handlerPath: string;
  handlerName: string;
};

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

export type Sources = { [key: string]: string | Sources };

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
