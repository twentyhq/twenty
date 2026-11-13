import { describe, expect, it } from 'vitest';

import { buildTeamsUserSearchUrl } from 'src/features/chat/logic-functions/utils/build-teams-user-search-url';

describe('buildTeamsUserSearchUrl', () => {
  it('builds a startswith filter across name, mail and UPN with the cap', () => {
    const url = buildTeamsUserSearchUrl({ query: 'ada', top: 10 });

    const decoded = decodeURIComponent(url);

    expect(decoded).toContain(
      "startswith(displayName,'ada') or startswith(mail,'ada') or startswith(userPrincipalName,'ada')",
    );
    expect(url).toContain('$top=10');
    expect(url).toContain(
      'users?$select=id,displayName,mail,userPrincipalName',
    );
  });

  it('escapes single quotes so a crafted query cannot break out of the literal', () => {
    const url = buildTeamsUserSearchUrl({ query: "o'brien", top: 10 });

    expect(decodeURIComponent(url)).toContain("startswith(displayName,'o''brien')");
  });
});
