import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { RegularEditableCell } from '../__stories__/EditableCell.stories';

it('Checks the EditableCell editing event bubbles up', async () => {
  const func = jest.fn(() => null);
  const { getByTestId } = render(<RegularEditableCell changeHandler={func} />);

  const parent = getByTestId('content-editable-parent');
  expect(parent).not.toBeNull();
  const editable = parent.querySelector('[contenteditable]');
  expect(editable).not.toBeNull();
  editable && userEvent.click(editable);
  userEvent.keyboard('a');
  expect(func).toBeCalled();
});
