import { type Manifest } from 'twenty-shared/application';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { buildPullEntities } from '@/app/pull/build-pull-entities';

export const buildPullBaseEntities = ({
  manifest,
  unreconciledUniversalIdentifiers,
  standaloneFieldUniversalIdentifiers,
}: {
  manifest: Manifest | null;
  unreconciledUniversalIdentifiers?: ReadonlySet<string>;
  standaloneFieldUniversalIdentifiers?: ReadonlySet<string>;
}) => {
  if (!isDefined(manifest)) {
    return [];
  }

  return buildPullEntities(
    manifest,
    standaloneFieldUniversalIdentifiers,
  ).entities.map((entity) => {
    if (
      entity.kind !== 'application' ||
      !isPlainObject(entity.config) ||
      !unreconciledUniversalIdentifiers?.has(
        manifest.application.defaultRoleUniversalIdentifier?.toLowerCase(),
      )
    ) {
      return entity;
    }

    // A skipped default role still owns the application's default-role declaration.
    const { defaultRoleUniversalIdentifier: _identifier, ...config } =
      entity.config;

    return { ...entity, config };
  });
};
