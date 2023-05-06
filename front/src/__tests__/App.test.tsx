import { render, waitFor } from '@testing-library/react';
import { RegularApp } from '../__stories__/App.stories';

const assignMock = jest.fn();

delete window.location;
window.location = { assign: assignMock };

it('Checks the App component renders', async () => {
  const { getByText } = render(<RegularApp />);

  expect(getByText('Companies')).toBeDefined();
  await waitFor(() => {
    expect(getByText('Twenty')).toBeDefined();
  });
});
