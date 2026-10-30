export type LocalEnvironment = {
  name: string;
  port: number;
  volumes: Record<string, string>;
};

export type LocalContainer = {
  id: string;
  image: string;
  running: boolean;
  port: number;
};
