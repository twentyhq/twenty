import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SpreadsheetImport } from '@/spreadsheet-import/components/SpreadsheetImport';
import { mockRsiValues } from '@/spreadsheet-import/tests/mockRsiValues';

import '@testing-library/jest-dom';

test('Close modal', async () => {
  let isOpen = true;
  const onClose = jest.fn(() => {
    isOpen = !isOpen;
  });
  const { getByText, getByLabelText } = render(
    <SpreadsheetImport {...mockRsiValues} onClose={onClose} isOpen={isOpen} />,
  );

  const closeButton = getByLabelText('Close modal');

  await userEvent.click(closeButton);

  const confirmButton = getByText('Exit flow');

  await userEvent.click(confirmButton);
  expect(onClose).toBeCalled();
});

test('Should throw error if no fields are provided', async () => {
  const errorRender = () =>
    render(<SpreadsheetImport {...mockRsiValues} fields={undefined} />);

  expect(errorRender).toThrow();
});
