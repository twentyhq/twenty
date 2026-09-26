import { readFileSync } from 'fs';
import { join } from 'path';

type RestrictedImportsOptions = {
  patterns?: { group: string[] }[];
};

type OxlintOverride = {
  files: string[];
  rules?: {
    'no-restricted-imports'?: [string, RestrictedImportsOptions];
  };
};

const UPGRADE_COMMAND_IMPORT_GROUP =
  'src/database/commands/upgrade-version-command/**';

const FILES_ALLOWED_TO_IMPORT_UPGRADE_COMMANDS = [
  /^src\/database\/commands\//,
  /^src\/engine\/core-modules\/upgrade\//,
  /^test\//,
  /__tests__/,
  /\.spec\.ts$/,
  /\.integration-spec\.ts$/,
];

const oxlintConfig = JSON.parse(
  readFileSync(join(__dirname, '../../../../../.oxlintrc.json'), 'utf8'),
);

const restrictsUpgradeCommandImports = (
  options: RestrictedImportsOptions | undefined,
) =>
  (options?.patterns ?? []).some(({ group }) =>
    group.includes(UPGRADE_COMMAND_IMPORT_GROUP),
  );

describe('upgrade command import guard', () => {
  it('is enabled for runtime code by default', () => {
    expect(
      restrictsUpgradeCommandImports(
        oxlintConfig.rules['no-restricted-imports'][1],
      ),
    ).toBe(true);
  });

  // An override replaces no-restricted-imports instead of merging it, so any
  // override matching runtime files has to restate the guard.
  it('is kept by every override that covers runtime files', () => {
    const overridesDroppingTheGuard = (
      oxlintConfig.overrides as OxlintOverride[]
    )
      .filter(({ rules }) => rules?.['no-restricted-imports'] !== undefined)
      .filter(({ files }) =>
        files.some(
          (file) =>
            !FILES_ALLOWED_TO_IMPORT_UPGRADE_COMMANDS.some((pattern) =>
              pattern.test(file),
            ),
        ),
      )
      .filter(
        ({ rules }) =>
          !restrictsUpgradeCommandImports(
            rules?.['no-restricted-imports']?.[1],
          ),
      )
      .map(({ files }) => files);

    expect(overridesDroppingTheGuard).toEqual([]);
  });
});
