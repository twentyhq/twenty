import { render, screen } from '@testing-library/react';

import { SettingsApplicationAboutSidebar } from '@/settings/applications/components/SettingsApplicationAboutSidebar';

describe('SettingsApplicationAboutSidebar', () => {
  it('should not render invalid author values', () => {
    render(
      <SettingsApplicationAboutSidebar
        author={{ name: 'Acme' } as unknown as string}
      />,
    );

    expect(screen.queryByText('Created by')).not.toBeInTheDocument();
  });

  it('should render a valid author value', () => {
    render(<SettingsApplicationAboutSidebar author="Acme" />);

    expect(screen.getByText('Created by')).toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
  });
});
