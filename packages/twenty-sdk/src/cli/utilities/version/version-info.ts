export type VersionInfo = {
  cliVersion: string;
  localServerVersion: string | null;
  latestServerVersion: string | null;
  isMinorOrMajorBehind: boolean;
  daysBehind: number | null;
};
