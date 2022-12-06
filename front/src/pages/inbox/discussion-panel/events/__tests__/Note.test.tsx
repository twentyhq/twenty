import { render } from '@testing-library/react';

import { NoteDefault } from '../__stories__/Note.stories';

it('Checks the booking event render', () => {
  const { getAllByText } = render(<NoteDefault />);

  const text = getAllByText('Hello I’m here bla bla bla');
  expect(text).toBeDefined();
});
