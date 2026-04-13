import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { describe, expect, it } from 'vitest';

import { findInstalledApp } from './helpers';

describe('App installation', () => {
  it('should find the installed app in the applications list', async () => {
    const app = await findInstalledApp(APPLICATION_UNIVERSAL_IDENTIFIER);
    expect(app).toBeDefined();
  });
});
