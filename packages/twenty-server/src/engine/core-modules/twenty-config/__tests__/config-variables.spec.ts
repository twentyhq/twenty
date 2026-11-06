import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';

const getServerInternalUrlErrors = (serverInternalUrl: string) =>
  validateSync(
    plainToClass(ConfigVariables, { SERVER_INTERNAL_URL: serverInternalUrl }),
    { strictGroups: true },
  ).filter(({ property }) => property === 'SERVER_INTERNAL_URL');

describe('SERVER_INTERNAL_URL', () => {
  it('accepts an empty value, which falls back to SERVER_URL', () => {
    expect(getServerInternalUrlErrors('')).toEqual([]);
  });

  it('accepts a private URL without a top-level domain', () => {
    expect(getServerInternalUrlErrors('http://twenty-server:3000')).toEqual([]);
  });

  it('rejects a value without a protocol', () => {
    expect(getServerInternalUrlErrors('twenty-server:3000')).toHaveLength(1);
  });
});
