import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { ChatReferenceNavigationEnabledContext } from '@/ai/contexts/ChatReferenceNavigationEnabledContext';

const renderChip = ({
  isNavigationEnabled,
}: {
  isNavigationEnabled: boolean;
}) =>
  render(
    <MemoryRouter>
      <ChatReferenceNavigationEnabledContext.Provider
        value={isNavigationEnabled}
      >
        <ChatReferenceChipDisplay
          displayName="Acme"
          leftComponent={null}
          to="/objects/companies/acme-id"
        />
      </ChatReferenceNavigationEnabledContext.Provider>
    </MemoryRouter>,
  );

describe('ChatReferenceChipDisplay', () => {
  it('should link to the reference when navigation is enabled', () => {
    renderChip({ isNavigationEnabled: true });

    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      '/objects/companies/acme-id',
    );
  });

  it('should render a plain chip when navigation is disabled', () => {
    renderChip({ isNavigationEnabled: false });

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Acme')).toBeInTheDocument();
  });

  it('should not show a pointer cursor when navigation is disabled', () => {
    renderChip({ isNavigationEnabled: false });

    expect(screen.getByTestId('chip').className).not.toMatch(/cursorPointer/);
  });
});
