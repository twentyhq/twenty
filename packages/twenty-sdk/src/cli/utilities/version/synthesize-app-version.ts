// Private apps deployed through a CI/CD pipeline don't want to manually bump
// the package.json version on every deploy. We synthesize a monotonic semver
// from the current time so the server's strictly-increasing version check
// always passes, and attach the short commit SHA (read from the CI
// environment) as build metadata for traceability — semver ignores build
// metadata when comparing precedence, so it never affects ordering.
export const synthesizeAppVersion = (): string => {
  const timestampInMilliseconds = Date.now();
  const shortSha = getCommitShaFromEnv();
  const baseVersion = `0.0.${timestampInMilliseconds}`;

  return shortSha ? `${baseVersion}+${shortSha}` : baseVersion;
};

// CI providers expose the deployed commit as an environment variable
// (GitHub Actions sets GITHUB_SHA, GitLab CI sets CI_COMMIT_SHA).
const getCommitShaFromEnv = (): string | undefined => {
  const sha = process.env.GITHUB_SHA ?? process.env.CI_COMMIT_SHA;

  return sha ? sha.slice(0, 7) : undefined;
};
