import { fireEvent, render } from '@testing-library/react';

import { EditableChipStory } from '../__stories__/EditableChip.stories';
import CompanyChip from '../../chip/CompanyChip';

it('Checks the EditableChip editing event bubbles up', async () => {
  const func = jest.fn(() => null);
  const { getByTestId } = render(
    <EditableChipStory
      value="test"
      picture="http://"
      changeHandler={func}
      ChipComponent={CompanyChip}
    />,
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

  fireEvent.change(editableInput, { target: { value: 'Test' } });
  expect(func).toBeCalledWith('Test');
});
