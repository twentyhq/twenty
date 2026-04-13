import { APPLICATION_UNIVERSAL_IDENTIFIER } from 'src/application.config';
import { describe, expect, it } from 'vitest';

import { findInstalledApp, findObjectByName } from './helpers';

describe('App installation', () => {
  it('should find the installed app in the applications list', async () => {
    const app = await findInstalledApp(APPLICATION_UNIVERSAL_IDENTIFIER);
    expect(app).toBeDefined();
  });
});

describe('PostCard object', () => {
  it('should exist with expected fields and relations', async () => {
    const obj = await findObjectByName('postCard');

    expect(obj).toBeDefined();

    const names = obj!.fields.edges.map((e) => e.node.name);
    expect(names).toContain('name');
    expect(names).toContain('content');
    expect(names).toContain('status');
    expect(names).toContain('deliveredAt');
    expect(names).toContain('recipient');
  });
});
