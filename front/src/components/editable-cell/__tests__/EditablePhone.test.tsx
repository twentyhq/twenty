import { fireEvent, render } from '@testing-library/react';

import { EditablePhoneStory } from '../__stories__/EditablePhone.stories';

it('Checks the EditablePhone editing event bubbles up', async () => {
  const func = jest.fn(() => null);
  const { getByTestId } = render(
    <EditablePhoneStory value="+33786405315" changeHandler={func} />,
  );

  const parent = getByTestId('content-editable-parent');

  const wrapper = parent.querySelector('div');

  if (!wrapper) {
    throw new Error('Editable input not found');
  }
  fireEvent.click(wrapper);

  const editableInput = parent.querySelector('input');

  if (!editableInput) {
    throw new Error('Editable input not found');
  }

  fireEvent.change(editableInput, { target: { value: '23' } });
  expect(func).toBeCalledWith('23');
});
