import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';

import { NavigatePreservingSearchAndHash } from '@/app/routing/components/NavigatePreservingSearchAndHash';

const LocationProbe = () => {
  const location = useLocation();

  return (
    <div data-testid="location">
      {location.pathname + location.search + location.hash}
    </div>
  );
};

describe('NavigatePreservingSearchAndHash', () => {
  it('keeps the search and hash when redirecting', () => {
    render(
      <MemoryRouter initialEntries={['/objects/workflows?panel=%2Fagents#top']}>
        <Routes>
          <Route
            path="/objects/workflows"
            element={<NavigatePreservingSearchAndHash to="/workflows" />}
          />
          <Route path="/workflows" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('location')).toHaveTextContent(
      '/workflows?panel=%2Fagents#top',
    );
  });
});
