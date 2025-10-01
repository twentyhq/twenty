export type PackageJson = {
  $schema?: string;
  standardId: string;
  label: string;
  description?: string;
  engines: {
    node: string;
    npm: string;
    yarn: string;
  };
  icon?: string;
  version: string;
  dependencies?: object;
  devDependencies?: object;
};

export type AppManifest = PackageJson & {
  agents: AgentManifest[];
  objects: ObjectManifest[];
  serverlessFunctions: ServerlessFunctionManifest[];
};

export type ServerlessFunctionManifest = {
  $schema?: string;
  universalIdentifier: string;
  name: string;
  description?: string;
  timeoutSeconds?: number;
  triggers: ServerlessFunctionTriggerManifest[];
  code: ServerlessFunctionCodeManifest;
};

export type ServerlessFunctionTriggerManifest =
  | {
      type: 'cron';
      schedule: string;
    }
  | {
      type: 'databaseEvent';
      eventName: string;
    }
  | {
      type: 'route';
      path: string;
      method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      isAuthRequired: boolean;
    };

type Sources = { [key: string]: string | Sources };

export type ServerlessFunctionCodeManifest = {
  src: {
    'index.ts': string;
  } & Sources;
};

export type ObjectManifest = {
  $schema?: string;
  standardId: string;
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
