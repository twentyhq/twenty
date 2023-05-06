import { fireEvent, render, waitFor } from '@testing-library/react';

import { EditableDateStory } from '../__stories__/EditableDate.stories';
import { act } from 'react-dom/test-utils';

it('Checks the EditableDate editing event bubbles up', async () => {
  const changeHandler = jest.fn(() => null);
  const { getByTestId, getByText } = render(
    <EditableDateStory
      value={new Date('2021-03-03')}
      changeHandler={changeHandler}
    />,
  );

  const parent = getByTestId('content-editable-parent');

  const wrapper = parent.querySelector('div');

  if (!wrapper) {
    throw new Error('Cell Wrapper not found');
  }

  act(() => {
    fireEvent.click(wrapper);
    const dateDisplay = parent.querySelector('div');
    if (!dateDisplay) {
      throw new Error('Editable input not found');
    }
  });
  waitFor(() => {
    expect(getByText('March 2021')).toBeInTheDocument();
  });

  fireEvent.click(getByText('5'));
  expect(changeHandler).toHaveBeenCalledWith(new Date('2021-03-05'));
});
