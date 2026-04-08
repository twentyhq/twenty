import { defineRule } from '@oxlint/plugins';

export const RULE_NAME = 'upgrade-command-filename';

const WORKSPACE_COMMAND_REGEX =
  /^\d+-\d+-workspace-command-\d{13,}-[a-z0-9]+(?:-[a-z0-9]+)*\.command\.ts$/;

const INSTANCE_COMMAND_REGEX =
  /^\d+-\d+-instance-command-fast-\d{13,}-[a-z0-9]+(?:-[a-z0-9]+)*\.ts$/;

const SKIPPED_FILE_REGEX =
  /\.(module|spec|test|snap)\.ts$|__tests__|__mocks__|__snapshots__/;

const COMMAND_PREFIX_REGEX = /^\d+-\d+-/;

const extractUpgradeCommandRelativePath = (
  filename: string,
): string | null => {
  const marker = 'upgrade-version-command/';
  const index = filename.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return filename.slice(index + marker.length);
};

export const rule = defineRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce consistent filename patterns for workspace and instance upgrade commands',
    },
    schema: [],
    messages: {
      invalidWorkspaceCommandFilename:
        "Workspace command filename '{{ name }}' must match pattern: {major}-{minor}-workspace-command-{timestamp}-{description}.command.ts (e.g. '1-21-workspace-command-1775500001000-add-feature.command.ts')",
      invalidInstanceCommandFilename:
        "Instance command filename '{{ name }}' must match pattern: {major}-{minor}-instance-command-fast-{timestamp}-{description}.ts (e.g. '1-21-instance-command-fast-1775500001000-add-column.ts')",
      invalidUpgradeCommandFilename:
        "Upgrade command filename '{{ name }}' does not match any recognized pattern. Expected workspace-command or instance-command-fast format.",
    },
  },
  create: (context) => {
    return {
      Program: (node: any) => {
        const relativePath = extractUpgradeCommandRelativePath(
          context.filename,
        );

        if (!relativePath) {
          return;
        }

        const segments = relativePath.split('/');
        const basename = segments[segments.length - 1];

        if (SKIPPED_FILE_REGEX.test(basename)) {
          return;
        }

        if (!COMMAND_PREFIX_REGEX.test(basename)) {
          return;
        }

        if (basename.includes('workspace-command-')) {
          if (!WORKSPACE_COMMAND_REGEX.test(basename)) {
            context.report({
              node,
              messageId: 'invalidWorkspaceCommandFilename',
              data: { name: basename },
            });
          }

          return;
        }

        if (basename.includes('instance-command-fast-')) {
          if (!INSTANCE_COMMAND_REGEX.test(basename)) {
            context.report({
              node,
              messageId: 'invalidInstanceCommandFilename',
              data: { name: basename },
            });
          }

          return;
        }

        context.report({
          node,
          messageId: 'invalidUpgradeCommandFilename',
          data: { name: basename },
        });
      },
    };
  },
});
