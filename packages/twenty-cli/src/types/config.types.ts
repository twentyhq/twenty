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

type ApplicationVariable = {
  universalIdentifier: string;
  value?: string;
  description?: string;
  isSecret?: boolean;
};

export type Application = {
  universalIdentifier: string;
  displayName?: string;
  description?: string;
  icon?: string;
  applicationVariables?: Record<string, ApplicationVariable>;
};

export type AppManifest = {
  application: Application;
  objects: ObjectManifest[];
  serverlessFunctions: ServerlessFunctionManifest[];
  sources: Sources;
};

export type ServerlessFunctionManifest = {
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

export type ServerlessFunctionTriggerManifest = {
  universalIdentifier: string;
} & (CronTrigger | DatabaseEventTrigger | RouteTrigger);

export type Sources = { [key: string]: string | Sources };

export type ObjectManifest = {
  universalIdentifier: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon?: string;
};

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
