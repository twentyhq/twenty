import { render, waitFor } from '@testing-library/react';
import { RegularApp } from '../__stories__/App.stories';

const assignMock = jest.fn();

delete window.location;
window.location = { assign: assignMock };

it('Checks the App component renders', async () => {
  const { getByText } = render(<RegularApp />);

  expect(getByText('People')).toBeDefined();
  expect(getByText('Companies')).toBeDefined();
  expect(getByText('Opportunities')).toBeDefined();
  await waitFor(() => {
    expect(getByText('Twenty')).toBeDefined();
  });
});
