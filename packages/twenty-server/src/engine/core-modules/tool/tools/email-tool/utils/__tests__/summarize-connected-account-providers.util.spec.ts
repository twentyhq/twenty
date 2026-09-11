import { ConnectedAccountProvider } from 'twenty-shared/types';

import { summarizeConnectedAccountProviders } from 'src/engine/core-modules/tool/tools/email-tool/utils/summarize-connected-account-providers.util';

describe('summarizeConnectedAccountProviders', () => {
  it('reports none when there is nothing to summarize', () => {
    expect(summarizeConnectedAccountProviders([])).toBe('none');
  });

  it('counts each provider and orders them predictably', () => {
    expect(
      summarizeConnectedAccountProviders([
        { provider: ConnectedAccountProvider.OIDC },
        { provider: ConnectedAccountProvider.APP },
        { provider: ConnectedAccountProvider.APP },
      ]),
    ).toBe('2 app, 1 oidc');
  });

  it('never exposes account handles', () => {
    const summary = summarizeConnectedAccountProviders([
      { provider: ConnectedAccountProvider.GOOGLE },
    ]);

    expect(summary).toBe('1 google');
    expect(summary).not.toContain('@');
  });
});
