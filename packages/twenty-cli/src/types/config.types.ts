export interface TwentyConfig {
  apiUrl: string;
  apiKey?: string;
  defaultApp?: string;
}

export type PackageJson = {
  $schema?: string;
  standardId: string;
  label: string;
  license: string;
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
};

export type CoreEntityManifest = AgentManifest | ObjectManifest;

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
