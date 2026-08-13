import { createOpenCommandConfirmationModalAdapter } from '../createOpenCommandConfirmationModalAdapter';
import { handleCommandConfirmationModalResult } from '../handleCommandConfirmationModalResult';

type OpenModalAdapter = ReturnType<
  typeof createOpenCommandConfirmationModalAdapter
>;

const modalParams = {} as Parameters<OpenModalAdapter>[0];

describe('createOpenCommandConfirmationModalAdapter', () => {
  afterEach(async () => {
    await handleCommandConfirmationModalResult('cancel');
  });

  it('should reject with a coded error when a modal is already pending', async () => {
    const openCommandConfirmationModal =
      createOpenCommandConfirmationModalAdapter({
        openCommandConfirmationModal: jest.fn(async () => {}),
      });

    const firstConfirmationResultPromise =
      openCommandConfirmationModal(modalParams);

    await expect(
      openCommandConfirmationModal(modalParams),
    ).rejects.toMatchObject({
      code: 'FRONT_COMPONENT_CONFIRMATION_MODAL_ALREADY_PENDING',
    });

    await handleCommandConfirmationModalResult('cancel');
    await expect(firstConfirmationResultPromise).resolves.toBe('cancel');
  });

  it('should reject and clear the pending state when the host call fails', async () => {
    const openCommandConfirmationModal =
      createOpenCommandConfirmationModalAdapter({
        openCommandConfirmationModal: jest
          .fn(async () => {})
          .mockRejectedValueOnce(new Error('host modal failed')),
      });

    await expect(openCommandConfirmationModal(modalParams)).rejects.toThrow(
      'host modal failed',
    );

    const retriedConfirmationResultPromise =
      openCommandConfirmationModal(modalParams);

    await handleCommandConfirmationModalResult('confirm');
    await expect(retriedConfirmationResultPromise).resolves.toBe('confirm');
  });
});
