export type VersionInfo = {
  cliVersion: string;
  localServerVersion: string | null;
  latestServerVersion: string | null;
  isMajorBehind: boolean;
  daysBehind: number | null;
};
