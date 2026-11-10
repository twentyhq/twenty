import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { resolvePositiveTtlMs } from 'src/engine/workspace-cache/utils/resolve-positive-ttl-ms.util';

const METADATA_CACHE_TTL_VARIABLES = [
  'METADATA_VISIBILITY_CACHE_MAX_AGE',
  'METADATA_RESPONSE_CACHE_TTL',
] as const;

const getInvalidProperties = (config: Record<string, unknown>) =>
  validateSync(plainToClass(ConfigVariables, config), { strictGroups: true })
    .map((validationError) => validationError.property)
    .filter((property) =>
      METADATA_CACHE_TTL_VARIABLES.some((variable) => variable === property),
    );

describe('metadata cache ttl config variables', () => {
  it.each(METADATA_CACHE_TTL_VARIABLES)('accepts the default %s', () => {
    expect(getInvalidProperties({})).toEqual([]);
  });

  it.each(METADATA_CACHE_TTL_VARIABLES)('accepts a positive %s', (variable) => {
    expect(getInvalidProperties({ [variable]: '60' })).toEqual([]);
  });

  it.each(METADATA_CACHE_TTL_VARIABLES)('rejects zero for %s', (variable) => {
    expect(getInvalidProperties({ [variable]: '0' })).toEqual([variable]);
  });

  it.each(
    METADATA_CACHE_TTL_VARIABLES.flatMap((variable) =>
      ['-1', 'not-a-number'].map((value) => ({ variable, value })),
    ),
  )(
    'never resolves $value in $variable to a non-expiring ttl',
    ({ variable, value }) => {
      expect(
        resolvePositiveTtlMs(
          plainToClass(ConfigVariables, { [variable]: value })[variable],
        ),
      ).toBe(3_600_000);
    },
  );
});
