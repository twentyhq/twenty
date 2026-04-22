/**
 * GitHub logins of former Twenty core team members ("alumni").
 *
 * They are flagged `isCoreTeam=false` in the workspace because they're no
 * longer on the team, but for the purpose of *external* contribution
 * stats / leaderboards we still want to exclude them — otherwise their
 * historical PRs/reviews would inflate the external numbers and crowd out
 * actual community contributors.
 *
 * Matched case-insensitively against `contributor.ghLogin`.
 */
export const ALUMNI_GITHUB_HANDLES: readonly string[] = [
  'guillim',
  'magrinj',
  'AMoreaux',
  'anamarn',
] as const;

const ALUMNI_HANDLES_LOWERCASE = new Set(
  ALUMNI_GITHUB_HANDLES.map((h) => h.toLowerCase()),
);

export const isAlumniGithubHandle = (
  ghLogin: string | null | undefined,
): boolean => {
  if (!ghLogin) return false;
  return ALUMNI_HANDLES_LOWERCASE.has(ghLogin.toLowerCase());
};
