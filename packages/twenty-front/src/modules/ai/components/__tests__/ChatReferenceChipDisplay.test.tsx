import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';

import { ChatReferenceChipDisplay } from '@/ai/components/ChatReferenceChipDisplay';
import { ChatReferenceNavigationEnabledContext } from '@/ai/contexts/ChatReferenceNavigationEnabledContext';

const LocationProbe = () => {
  const location = useLocation();

  return <div data-testid="location-probe">{location.pathname}</div>;
};

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

  it('should not look interactive when navigation is disabled', () => {
    renderChip({ isNavigationEnabled: false });

    const chipClassName = screen.getByTestId('chip').className;

    expect(chipClassName).not.toMatch(/cursorPointer/);
    expect(chipClassName).toMatch(/backgroundStatic/);
  });

  it('should run onClick on a plain click instead of navigating to `to`', () => {
    const onClickMock = jest.fn();

    render(
      <MemoryRouter initialEntries={['/chat/thread-id']}>
        <ChatReferenceNavigationEnabledContext.Provider value={true}>
          <ChatReferenceChipDisplay
            displayName="Acme"
            leftComponent={null}
            to="/objects/companies/acme-id"
            onClick={onClickMock}
          />
        </ChatReferenceNavigationEnabledContext.Provider>
        <LocationProbe />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link');
    fireEvent.mouseDown(link);
    fireEvent.click(link);

    expect(onClickMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('location-probe')).toHaveTextContent(
      '/chat/thread-id',
    );
  });
});
