import { fireEvent, render } from '@testing-library/react';

import { EditableCellStory } from '../__stories__/EditableCell.stories';

it('Checks the EditableCell editing event bubbles up', async () => {
  const func = jest.fn(() => null);
  const { getByTestId } = render(
    <EditableCellStory content="test" changeHandler={func} />,
  );

  const parent = getByTestId('content-editable-parent');
  const editableInput = parent.querySelector('input');

  if (!editableInput) {
    throw new Error('Editable input not found');
  }

  fireEvent.change(editableInput, { target: { value: '23' } });
  expect(func).toBeCalledWith('23');
});
