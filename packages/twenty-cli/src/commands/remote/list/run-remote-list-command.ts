import { isString } from '@sniptt/guards';

import { type CommandRun } from '@/catalog/types/command-run.type';
import { CREDENTIAL_KIND_LABELS } from '@/config/constants/credential-kind-labels.constant';
import { getConfigPath } from '@/config/get-config-path';
import { getCredentialKind } from '@/config/get-credential-kind';
import { readConfig } from '@/config/read-config';
import { formatTable } from '@/output/format-table';
import { colorText, dimText } from '@/output/style';

export const runRemoteListCommand: CommandRun = async () => {
  const config = await readConfig(getConfigPath());
  const remotes = Object.entries(config.remotes)
    .map(([name, remote]) => ({
      name,
      apiUrl: remote.apiUrl,
      credentials: getCredentialKind(remote),
      workspaceName: isString(remote.workspaceName)
        ? remote.workspaceName
        : null,
      isDefault: name === config.defaultRemote,
    }))
    .sort((first, second) => first.name.localeCompare(second.name));

  if (remotes.length === 0) {
    return {
      data: { remotes, defaultRemote: null },
      human: `No saved remotes. ${dimText('Sign in with: twenty auth login --url <url>')}`,
    };
  }

  return {
    data: { remotes, defaultRemote: config.defaultRemote ?? null },
    human: formatTable({
      rows: remotes,
      columns: [
        {
          header: ' ',
          value: (remote) => (remote.isDefault ? colorText('green', '●') : ''),
        },
        { header: 'NAME', value: (remote) => remote.name },
        { header: 'URL', value: (remote) => remote.apiUrl },
        {
          header: 'AUTH',
          value: (remote) => CREDENTIAL_KIND_LABELS[remote.credentials],
        },
        { header: 'WORKSPACE', value: (remote) => remote.workspaceName ?? '' },
      ],
    }),
  };
};
