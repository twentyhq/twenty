import { render, waitFor } from '@testing-library/react';
import { useHasAccessToken } from '../useHasAccessToken';

function TestComponent() {
  const hasAccessToken = useHasAccessToken();

  return (
    <div>{hasAccessToken && <div data-testid="has-access-token"></div>}</div>
  );
}

test('useHasAccessToken works properly if access token is present', async () => {
  localStorage.setItem('accessToken', 'test-access-token');
  const { getByTestId } = render(<TestComponent />);

  await waitFor(() => {
    expect(getByTestId('has-access-token')).toBeDefined();
  });
});

test('useHasAccessToken works properly if access token is not present', async () => {
  localStorage.removeItem('accessToken');
  const { container } = render(<TestComponent />);

  await waitFor(() => {
    expect(container.firstChild).toBeEmptyDOMElement();
  });
});

afterEach(() => {
  jest.clearAllMocks();
});
