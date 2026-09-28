import { beforeEach, describe, expect, it, vi } from 'vitest';

import { enqueueSlackToolResultSnackbar } from 'src/front-components/utils/enqueue-slack-tool-result-snackbar.util';

const { enqueueSnackbarMock } = vi.hoisted(() => ({
  enqueueSnackbarMock: vi.fn(),
}));

vi.mock('twenty-sdk/front-component', () => ({
  enqueueSnackbar: enqueueSnackbarMock,
}));

describe('enqueueSlackToolResultSnackbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show the message as a success', () => {
    enqueueSlackToolResultSnackbar({
      success: true,
      message: 'Saved the rule',
    });

    expect(enqueueSnackbarMock).toHaveBeenCalledWith({
      message: 'Saved the rule',
      variant: 'success',
    });
  });

  it('should prefer the error over the message on a failure', () => {
    enqueueSlackToolResultSnackbar({
      success: false,
      message: 'Could not save the rule',
      error: 'Slack rejected the channel',
    });

    expect(enqueueSnackbarMock).toHaveBeenCalledWith({
      message: 'Slack rejected the channel',
      variant: 'error',
    });
  });

  it('should fall back to the message when the error is empty', () => {
    enqueueSlackToolResultSnackbar({
      success: false,
      message: 'Could not save the rule',
      error: '',
    });

    expect(enqueueSnackbarMock).toHaveBeenCalledWith({
      message: 'Could not save the rule',
      variant: 'error',
    });
  });
});
