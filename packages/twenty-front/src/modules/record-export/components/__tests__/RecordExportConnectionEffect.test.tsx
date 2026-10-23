import { RecordExportConnectionEffect } from '@/record-export/components/RecordExportConnectionEffect';
import { render, waitFor } from '@testing-library/react';

it('cancels immediately when the page is hidden', () => {
  const cancel = jest.fn();
  render(<RecordExportConnectionEffect cancel={cancel} />);

  window.dispatchEvent(new Event('pagehide'));

  expect(cancel).toHaveBeenCalledTimes(1);
});

it('cancels the old connection when its callback changes', async () => {
  const previousCancel = jest.fn();
  const currentCancel = jest.fn();
  const { rerender, unmount } = render(
    <RecordExportConnectionEffect cancel={previousCancel} />,
  );

  rerender(<RecordExportConnectionEffect cancel={currentCancel} />);

  await waitFor(() => expect(previousCancel).toHaveBeenCalledTimes(1));
  expect(currentCancel).not.toHaveBeenCalled();

  window.dispatchEvent(new Event('pagehide'));

  expect(previousCancel).toHaveBeenCalledTimes(1);
  expect(currentCancel).toHaveBeenCalledTimes(1);

  unmount();

  await waitFor(() => expect(currentCancel).toHaveBeenCalledTimes(2));
});
