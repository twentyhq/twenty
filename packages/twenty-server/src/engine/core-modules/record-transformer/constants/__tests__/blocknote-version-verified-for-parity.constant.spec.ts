import { readFileSync } from 'fs';
import { join } from 'path';

import { BLOCKNOTE_VERSION_VERIFIED_FOR_PARITY } from 'src/engine/core-modules/record-transformer/constants/blocknote-version-verified-for-parity.constant';

describe('BLOCKNOTE_VERSION_VERIFIED_FOR_PARITY', () => {
  it('should match the pinned @blocknote/core version, run test/rich-text/check-blocknote-markdown-parity.ts after an upgrade', () => {
    const serverPackageJson = JSON.parse(
      readFileSync(join(__dirname, '../../../../../../package.json'), 'utf8'),
    );

    expect(serverPackageJson.dependencies['@blocknote/core']).toBe(
      BLOCKNOTE_VERSION_VERIFIED_FOR_PARITY,
    );
  });
});
