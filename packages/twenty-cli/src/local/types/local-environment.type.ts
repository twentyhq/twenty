export type LocalEnvironment = {
  name: string;
  port: number;
  volumes: Record<string, string>;
  requiredVolumeDestinations: string[];
  environmentVariables: string[];
};

export type LocalContainer = {
  id: string;
  image: string;
  imageId: string;
  environmentVariables: string[];
  isRunning: boolean;
  port: number;
  containerPort: number;
  mounts: { Type: string; Name?: string; Destination: string }[];
};
