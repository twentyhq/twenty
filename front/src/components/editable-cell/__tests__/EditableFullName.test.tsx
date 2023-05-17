import { fireEvent, render } from '@testing-library/react';

import { EditableFullNameStory } from '../__stories__/EditableFullName.stories';

it('Checks the EditableFullName editing event bubbles up', async () => {
  const func = jest.fn(() => null);
  const { getByTestId } = render(
    <EditableFullNameStory
      firstname="Jone"
      lastname="Doe"
      changeHandler={func}
    />,
  );

  const parent = getByTestId('content-editable-parent');

  const wrapper = parent.querySelector('div');

  if (!wrapper) {
    throw new Error('Editable input not found');
  }
  fireEvent.click(wrapper);

  const firstnameInput = parent.querySelector('input:first-child');

  if (!firstnameInput) {
    throw new Error('Editable input not found');
  }

  fireEvent.change(firstnameInput, { target: { value: 'Jo' } });
  expect(func).toBeCalledWith('Jo', 'Doe');

  const lastnameInput = parent.querySelector('input:last-child');

  if (!lastnameInput) {
    throw new Error('Editable input not found');
  }

  fireEvent.change(lastnameInput, { target: { value: 'Do' } });
  expect(func).toBeCalledWith('Jo', 'Do');
});
