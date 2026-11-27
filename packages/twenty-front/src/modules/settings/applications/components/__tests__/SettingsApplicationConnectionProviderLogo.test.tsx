import { render } from '@testing-library/react';

import { SettingsApplicationConnectionProviderLogo } from '@/settings/applications/components/SettingsApplicationConnectionProviderLogo';

describe('SettingsApplicationConnectionProviderLogo', () => {
  it('should render nothing when the connection provider has no logo', () => {
    const { container } = render(
      <SettingsApplicationConnectionProviderLogo
        connectionProvider={{
          displayName: 'LinkedIn',
          logoUrl: null,
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
        }}
      />,
    );

    expect(container).not.toBeEmptyDOMElement();
  });
});
