import { fireEvent, render } from '@testing-library/react';

import { ActionBarStory } from '../__stories__/ActionBar.stories';
import { act } from 'react-dom/test-utils';

it('Checks the ActionBar editing event bubbles up', async () => {
  const deleteFunc = jest.fn(() => null);
  const { getByText } = render(<ActionBarStory onDeleteClick={deleteFunc} />);

  expect(getByText('Delete')).toBeInTheDocument();

  act(() => {
    fireEvent.click(getByText('Delete'));
  });

  expect(deleteFunc).toHaveBeenCalled();
});
