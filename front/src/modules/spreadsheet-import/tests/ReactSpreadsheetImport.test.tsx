import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import '@testing-library/jest-dom';

import { ReactSpreadsheetImport } from '../ReactSpreadsheetImport';
import { mockRsiValues } from '../stories/mockRsiValues';

test('Close modal', async () => {
  let isOpen = true;
  const onClose = jest.fn(() => {
    isOpen = !isOpen;
  });
  const { getByText, getByLabelText } = render(
    <ReactSpreadsheetImport
      {...mockRsiValues}
      onClose={onClose}
      isOpen={isOpen}
    />,
  );

  const closeButton = getByLabelText('Close modal');

  await userEvent.click(closeButton);

  const confirmButton = getByText('Exit flow');

  await userEvent.click(confirmButton);
  expect(onClose).toBeCalled();
});

test('Should throw error if no fields are provided', async () => {
  const errorRender = () =>
    render(<ReactSpreadsheetImport {...mockRsiValues} fields={undefined} />);

  expect(errorRender).toThrow();
});
