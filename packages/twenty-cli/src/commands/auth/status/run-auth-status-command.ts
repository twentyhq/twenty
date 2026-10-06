import { isDefined } from 'twenty-shared/utils';

import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { CREDENTIAL_KIND_LABELS } from '@/config/constants/credential-kind-labels.constant';
import { getConfigPath } from '@/config/get-config-path';
import { readConfig } from '@/config/read-config';
import { getAccessTokenExpiry } from '@/oauth/is-access-token-expiring';
import { formatDetails } from '@/output/format-details';
import { dimText } from '@/output/style';
import { TARGET_ENVIRONMENT_VARIABLE } from '@/target/constants/target-environment-variable.constant';
import { fetchSignedInIdentity } from '@/transport/metadata/fetch-signed-in-identity';

const MINUTE_MILLISECONDS = 60_000;

const formatTimeLeft = (expiry: number) => {
  const minutes = Math.max(
    0,
    Math.round((expiry - Date.now()) / MINUTE_MILLISECONDS),
  );

  return minutes < 120
    ? `${minutes} minutes`
    : `${Math.round(minutes / 60)} hours`;
};

export const runAuthStatusCommand: CommandRun<TargetCommandContext> = async ({
  target,
  signal,
}) => {
  const identity = await fetchSignedInIdentity({ target, signal });
  const isDefaultRemote =
    isDefined(target.remoteName) &&
    (await readConfig(getConfigPath())).defaultRemote === target.remoteName;
  const sessionExpiry =
    target.credentialKind === 'oauth'
      ? getAccessTokenExpiry(target.bearerToken)
      : undefined;
  const remoteLabel = isDefined(target.remoteName)
    ? `${target.remoteName}${isDefaultRemote ? dimText(' (default)') : ''}`
    : dimText(
        `none, using ${TARGET_ENVIRONMENT_VARIABLE.API_URL} and ${TARGET_ENVIRONMENT_VARIABLE.API_KEY}`,
      );
  const credentialsLabel = isDefined(identity.email)
    ? `${identity.email} ${dimText(`via ${CREDENTIAL_KIND_LABELS[target.credentialKind]}`)}`
    : CREDENTIAL_KIND_LABELS[target.credentialKind];

  return {
    data: {
      remote: target.remoteName ?? null,
      isDefaultRemote,
      apiUrl: target.apiUrl,
      source: target.source,
      credentials: target.credentialKind,
      email: identity.email,
      workspaceName: identity.workspaceName,
      sessionExpiresAt: isDefined(sessionExpiry)
        ? new Date(sessionExpiry).toISOString()
        : null,
    },
    human: formatDetails([
      ['Remote', remoteLabel],
      ['Server', target.apiUrl],
      ['Workspace', identity.workspaceName ?? dimText('unnamed')],
      ['Signed in', credentialsLabel],
      [
        'Status',
        isDefined(sessionExpiry)
          ? `valid ${dimText(`· renews itself, current token expires in ${formatTimeLeft(sessionExpiry)}`)}`
          : 'valid',
      ],
    ]),
  };
};
