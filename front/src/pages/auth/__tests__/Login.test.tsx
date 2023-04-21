import { render } from '@testing-library/react';
import { LoginDefault } from '../__stories__/Login.stories';

const assignMock = jest.fn();

delete window.location;
window.location = { assign: assignMock };

afterEach(() => {
  assignMock.mockClear();
});

it('Checks the Login page render', () => {
  render(<LoginDefault />);
});
