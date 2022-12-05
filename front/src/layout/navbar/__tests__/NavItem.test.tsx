import { render, fireEvent } from '@testing-library/react';

import { NavItemDefault } from '../__stories__/NavItem.stories';

const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

it('Checks the NavItem renders', () => {
  const { getByRole } = render(<NavItemDefault />);

  const button = getByRole('button');
  expect(button).toHaveTextContent('Test');

  fireEvent.click(button);
  expect(mockedNavigate).toHaveBeenCalledWith('/test');
});
