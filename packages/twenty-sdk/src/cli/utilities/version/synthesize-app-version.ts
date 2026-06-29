import { execFileSync } from 'child_process';

// Private apps deployed through a CI/CD pipeline don't want to manually bump
// the package.json version on every deploy. We synthesize a monotonic semver
// from the current time so the server's strictly-increasing version check
// always passes, and attach the short git SHA as build metadata for
// traceability (semver ignores build metadata when comparing precedence).
export const synthesizeAppVersion = ({
  appPath,
}: {
  appPath: string;
}): string => {
  const timestampInMilliseconds = Date.now();
  const shortSha = tryGetGitShortSha(appPath);
  const baseVersion = `0.0.${timestampInMilliseconds}`;

  return shortSha ? `${baseVersion}+${shortSha}` : baseVersion;
};

const tryGetGitShortSha = (appPath: string): string | undefined => {
  try {
    return execFileSync('git', ['-C', appPath, 'rev-parse', '--short', 'HEAD'], {
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return undefined;
  }
};
