export type LocalEnvironment = {
  name: string;
  port: number;
  volumes: Record<string, string>;
  environmentVariables: string[];
};

export type LocalContainer = {
  id: string;
  image: string;
  isRunning: boolean;
  port: number;
};
