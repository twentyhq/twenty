import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import {
  type ConfigFile,
  type RemoteEntry,
} from '@/config/types/config-file.type';

const LEGACY_DEFAULT_PROFILE_NAME = 'default';

const LEGACY_REMOTE_NAME = 'local';

const LEGACY_FIELD_ALIASES: Record<string, string[]> = {
  twentyCLIAccessToken: ['accessToken', 'applicationAccessToken'],
  twentyCLIRefreshToken: ['refreshToken', 'applicationRefreshToken'],
  twentyCLIRegistrationClientId: ['oauthClientId'],
};

const LEGACY_ALIAS_FIELDS = Object.values(LEGACY_FIELD_ALIASES).flat();

const LEGACY_TOP_LEVEL_REMOTE_FIELDS = [
  'apiUrl',
  'apiKey',
  'appRegistrationId',
  'appRegistrationClientId',
  ...Object.entries(LEGACY_FIELD_ALIASES).flat(2),
];

const toRemoteEntry = (value: unknown): RemoteEntry | undefined => {
  if (!isPlainObject(value) || !isString(value.apiUrl)) {
    return undefined;
  }

  const aliasedFields = Object.fromEntries(
    Object.entries(LEGACY_FIELD_ALIASES).flatMap(([field, aliases]) => {
      const aliasValue = [field, ...aliases]
        .map((name) => value[name])
        .find(isString);

      return isDefined(aliasValue) ? [[field, aliasValue]] : [];
    }),
  );

  const fieldsWithoutAliases = Object.fromEntries(
    Object.entries(value).filter(
      ([field]) => !LEGACY_ALIAS_FIELDS.includes(field),
    ),
  );

  return { ...fieldsWithoutAliases, apiUrl: value.apiUrl, ...aliasedFields };
};

const normalizeRemotes = (
  value: unknown,
): Record<string, RemoteEntry> | undefined => {
  if (!isPlainObject(value)) {
    return undefined;
  }

  const remotes: Record<string, RemoteEntry> = {};

  for (const [name, entry] of Object.entries(value)) {
    const remote = toRemoteEntry(entry);

    if (!isDefined(remote)) {
      return undefined;
    }

    remotes[name] = remote;
  }

  return remotes;
};

const renameLegacyDefaultRemote = (remotes: Record<string, RemoteEntry>) => {
  if (
    !Object.hasOwn(remotes, LEGACY_DEFAULT_PROFILE_NAME) ||
    Object.hasOwn(remotes, LEGACY_REMOTE_NAME)
  ) {
    return { remotes, isRenamed: false };
  }

  const { [LEGACY_DEFAULT_PROFILE_NAME]: defaultProfile, ...otherRemotes } =
    remotes;

  return {
    remotes: { ...otherRemotes, [LEGACY_REMOTE_NAME]: defaultProfile },
    isRenamed: true,
  };
};

const normalizeLegacyConfig = (
  raw: Record<string, unknown>,
): ConfigFile | undefined => {
  const profileRemotes = normalizeRemotes(raw.profiles ?? {});
  const currentRemotes = normalizeRemotes(raw.remotes ?? {});

  if (!isDefined(profileRemotes) || !isDefined(currentRemotes)) {
    return undefined;
  }

  const topLevelRemote = toRemoteEntry(
    Object.fromEntries(
      LEGACY_TOP_LEVEL_REMOTE_FIELDS.filter((field) => field in raw).map(
        (field) => [field, raw[field]],
      ),
    ),
  );
  const otherFields = Object.fromEntries(
    Object.entries(raw).filter(
      ([field]) =>
        !LEGACY_TOP_LEVEL_REMOTE_FIELDS.includes(field) &&
        !['profiles', 'remotes', 'defaultWorkspace', 'version'].includes(field),
    ),
  );
  const { remotes, isRenamed } = renameLegacyDefaultRemote({
    ...profileRemotes,
    ...currentRemotes,
  });

  if (
    isDefined(topLevelRemote) &&
    !Object.hasOwn(remotes, LEGACY_REMOTE_NAME)
  ) {
    remotes[LEGACY_REMOTE_NAME] = topLevelRemote;
  }

  const defaultRemote =
    isRenamed && raw.defaultWorkspace === LEGACY_DEFAULT_PROFILE_NAME
      ? LEGACY_REMOTE_NAME
      : raw.defaultWorkspace;

  return {
    ...otherFields,
    version: 1,
    remotes,
    ...(isString(defaultRemote) ? { defaultRemote } : {}),
  };
};

export const normalizeConfig = (raw: unknown): ConfigFile | undefined => {
  if (!isPlainObject(raw)) {
    return undefined;
  }

  if (!isDefined(raw.version) && ('profiles' in raw || 'apiUrl' in raw)) {
    return normalizeLegacyConfig(raw);
  }

  const remotes = normalizeRemotes(raw.remotes ?? {});

  if (
    !isDefined(remotes) ||
    (isDefined(raw.defaultRemote) && !isString(raw.defaultRemote))
  ) {
    return undefined;
  }

  return { ...raw, version: 1, remotes };
};
