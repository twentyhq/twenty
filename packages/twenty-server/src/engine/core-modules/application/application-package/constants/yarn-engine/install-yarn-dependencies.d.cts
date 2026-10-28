export declare const installYarnDependencies: (options: {
  directory: string;
  yarnEngineDirectory: string;
  args: string[];
  env?: NodeJS.ProcessEnv;
  timeout?: number;
}) => Promise<{ stdout: string; stderr: string }>;
