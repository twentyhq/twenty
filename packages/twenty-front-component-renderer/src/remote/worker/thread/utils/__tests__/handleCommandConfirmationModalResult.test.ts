import { createOpenCommandConfirmationModalAdapter } from '../createOpenCommandConfirmationModalAdapter';
import { handleCommandConfirmationModalResult } from '../handleCommandConfirmationModalResult';

type OpenModalAdapter = ReturnType<
  typeof createOpenCommandConfirmationModalAdapter
>;

const modalParams = {} as Parameters<OpenModalAdapter>[0];

describe('handleCommandConfirmationModalResult', () => {
  afterEach(async () => {
    await handleCommandConfirmationModalResult('cancel');
  });

  it('should resolve the pending promise when the confirmation result arrives', async () => {
    const openCommandConfirmationModal =
      createOpenCommandConfirmationModalAdapter({
        openCommandConfirmationModal: jest.fn(async () => {}),
      });

    const confirmationResultPromise = openCommandConfirmationModal(modalParams);

    await handleCommandConfirmationModalResult('confirm');

    await expect(confirmationResultPromise).resolves.toBe('confirm');
  });

  it('should allow opening a new modal after the previous one resolved', async () => {
    const openCommandConfirmationModal =
      createOpenCommandConfirmationModalAdapter({
        openCommandConfirmationModal: jest.fn(async () => {}),
      });

    const firstConfirmationResultPromise =
      openCommandConfirmationModal(modalParams);
    await handleCommandConfirmationModalResult('confirm');
    await expect(firstConfirmationResultPromise).resolves.toBe('confirm');

    const secondConfirmationResultPromise =
      openCommandConfirmationModal(modalParams);
    await handleCommandConfirmationModalResult('cancel');
    await expect(secondConfirmationResultPromise).resolves.toBe('cancel');
  });

  it('should ignore confirmation results when no modal is pending', async () => {
    await expect(
      handleCommandConfirmationModalResult('confirm'),
    ).resolves.toBeUndefined();
  });
});
