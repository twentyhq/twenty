import { describe, expect, it } from 'vitest';

import applicationConfig from 'src/application-config';

const UUID_V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('application config', () => {
  it('declares a valid v4 universal identifier', () => {
    expect(applicationConfig.config.universalIdentifier).toMatch(UUID_V4);
  });
});
