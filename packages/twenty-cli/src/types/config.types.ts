export interface TwentyConfig {
  apiUrl: string;
  apiKey?: string;
  defaultApp?: string;
}

export interface AppManifest {
  universalIdentifier: string;
  label: string;
  description?: string;
  icon?: string;
  version: string;
  agents: AgentManifest[];
}

export interface AgentManifest {
  universalIdentifier: string;
  name: string;
  label: string;
  description?: string;
  icon?: string;
  prompt: string;
  modelId?: string;
  responseFormat?: AgentResponseFormat;
}

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
