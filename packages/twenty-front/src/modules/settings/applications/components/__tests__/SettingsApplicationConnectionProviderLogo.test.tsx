import { render } from '@testing-library/react';

import { SettingsApplicationConnectionProviderLogo } from '@/settings/applications/components/SettingsApplicationConnectionProviderLogo';

describe('SettingsApplicationConnectionProviderLogo', () => {
  it('should render nothing when the connection provider has no logo', () => {
    const { container } = render(
      <SettingsApplicationConnectionProviderLogo
        connectionProvider={{
          displayName: 'LinkedIn',
          logoUrl: null,
          via: { name: 'Unipile', logoUrl: 'https://example.com/unipile.svg' },
        }}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('should render the connection provider logo', () => {
    const { container } = render(
      <SettingsApplicationConnectionProviderLogo
        connectionProvider={{
          displayName: 'LinkedIn',
          logoUrl: 'https://example.com/linkedin.svg',
          via: null,
        }}
      />,
    );

    expect(container).not.toBeEmptyDOMElement();
  });
});
