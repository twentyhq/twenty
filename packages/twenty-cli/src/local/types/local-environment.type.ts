export type LocalEnvironment = {
  name: string;
  port: number;
  volumes: Record<string, string>;
  requiredVolumeDestinations: string[];
};

export type LocalContainer = {
  id: string;
  image: string;
  imageId: string;
  environmentVariables: string[];
  running: boolean;
  port: number;
  containerPort: number;
  mounts: { Type: string; Name?: string; Destination: string }[];
};
