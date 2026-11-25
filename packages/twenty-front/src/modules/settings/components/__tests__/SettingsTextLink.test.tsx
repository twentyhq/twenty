import { render, screen } from '@testing-library/react';

import { SettingsTextLink } from '@/settings/components/SettingsTextLink';

describe('SettingsTextLink', () => {
  it('should open an external link in a new tab', () => {
    render(
      <SettingsTextLink href="https://hub.docker.com/r/twentycrm/twenty">
        v2.64.0
      </SettingsTextLink>,
    );

    const link = screen.getByRole('link', { name: 'v2.64.0' });

    expect(link).toHaveAttribute(
      'href',
      'https://hub.docker.com/r/twentycrm/twenty',
    );
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
