import { type HTTPMethod } from 'src/engine/metadata-modules/route-trigger/route-trigger.entity';

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

type Sources = { [key: string]: string | Sources };

type Application = {
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
  handlerPath: string;
  handlerName: string;
  triggers: ServerlessFunctionTriggerManifest[];
};

export type ServerlessFunctionTriggerManifest = (
  | {
      type: 'cron';
      pattern: string;
    }
  | {
      type: 'databaseEvent';
      eventName: string;
    }
  | {
      type: 'route';
      path: string;
      httpMethod: HTTPMethod;
      isAuthRequired: boolean;
    }
) & {
  universalIdentifier: string;
};

export type ObjectManifest = {
  universalIdentifier: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description?: string;
  icon?: string;
};

interface AgentResponseFormat {
  type: 'json' | 'text';
  schema?: Record<string, unknown>;
}

export type AgentManifest = {
  $schema?: string;
  standardId: string;
  name: string;
  label: string;
  description?: string;
  icon?: string;
  prompt: string;
  modelId: string;
  responseFormat?: AgentResponseFormat;
};
