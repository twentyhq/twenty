import { isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { type PullEntity } from '@/app/pull/build-pull-entities';

export const buildPullBaseEntities = ({
  entities,
  unreconciledUniversalIdentifiers,
}: {
  entities: PullEntity[];
  unreconciledUniversalIdentifiers?: ReadonlySet<string>;
}): PullEntity[] =>
  entities.map((entity) => {
    if (
      entity.kind !== 'application' ||
      !isPlainObject(entity.config) ||
      !isString(entity.config.defaultRoleUniversalIdentifier) ||
      !unreconciledUniversalIdentifiers?.has(
        entity.config.defaultRoleUniversalIdentifier.toLowerCase(),
      )
    ) {
      return entity;
    }

    // A skipped default role still owns the application's default-role declaration.
    const { defaultRoleUniversalIdentifier: _identifier, ...config } =
      entity.config;

    return { ...entity, config };
  });
