import {
  createOpenCommandConfirmationModalAdapter,
  handleCommandConfirmationModalResult,
} from '../createCommandConfirmationModalBridge';

type OpenModalAdapter = ReturnType<
  typeof createOpenCommandConfirmationModalAdapter
>;

const modalParams = {} as Parameters<OpenModalAdapter>[0];

describe('createCommandConfirmationModalBridge', () => {
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
        openCommandConfirmationModal: jest.fn(async () => {
          throw new Error('host modal failed');
        }),
      });

    await expect(openCommandConfirmationModal(modalParams)).rejects.toThrow(
      'host modal failed',
    );

    const retriedConfirmationResultPromise =
      openCommandConfirmationModal(modalParams);

    await handleCommandConfirmationModalResult('confirm');
    await expect(retriedConfirmationResultPromise).resolves.toBe('confirm');
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
