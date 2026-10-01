import { createFrontComponentMediaCapabilityPolicy } from '@/front-components/media-session/utils/createFrontComponentMediaCapabilityPolicy';

describe('createFrontComponentMediaCapabilityPolicy', () => {
  const abortSignal = new AbortController().signal;

  it('does not prompt for access already granted to the application', async () => {
    const requestApproval = jest.fn();
    const policy = createFrontComponentMediaCapabilityPolicy({
      getGrantedCapabilities: () => ['microphone'],
      requestApproval,
    });

    await expect(
      policy({ mediaTypes: ['audio'], abortSignal }),
    ).resolves.toBeNull();
    expect(requestApproval).not.toHaveBeenCalled();
  });

  it('waits for the saved grant before allowing capture', async () => {
    let completeApproval: (capabilities: string[]) => void = () => undefined;
    const requestApproval = jest.fn(
      () =>
        new Promise<string[]>((resolve) => {
          completeApproval = resolve;
        }),
    );
    const policy = createFrontComponentMediaCapabilityPolicy({
      getGrantedCapabilities: () => [],
      requestApproval,
    });
    const onAllowed = jest.fn();
    const pendingCapture = policy({ mediaTypes: ['audio'], abortSignal }).then(
      onAllowed,
    );

    expect(onAllowed).not.toHaveBeenCalled();
    completeApproval(['microphone']);
    await pendingCapture;

    expect(onAllowed).toHaveBeenCalledWith(null);
  });

  it('still denies unapproved media types after a partial approval', async () => {
    const policy = createFrontComponentMediaCapabilityPolicy({
      getGrantedCapabilities: () => [],
      requestApproval: jest.fn().mockResolvedValue(['microphone']),
    });

    await expect(
      policy({ mediaTypes: ['audio', 'video'], abortSignal }),
    ).resolves.toMatchObject({
      errorName: 'NotAllowedError',
      errorMessage: expect.stringContaining('camera'),
    });
  });

  it('denies capture when the user cancels', async () => {
    const policy = createFrontComponentMediaCapabilityPolicy({
      getGrantedCapabilities: () => [],
      requestApproval: jest.fn().mockResolvedValue([]),
    });

    await expect(
      policy({ mediaTypes: ['audio'], abortSignal }),
    ).resolves.toMatchObject({
      errorName: 'NotAllowedError',
    });
  });

  it('does not prompt for an aborted request', async () => {
    const controller = new AbortController();
    controller.abort();
    const requestApproval = jest.fn();
    const policy = createFrontComponentMediaCapabilityPolicy({
      getGrantedCapabilities: () => [],
      requestApproval,
    });

    await policy({ mediaTypes: ['audio'], abortSignal: controller.signal });

    expect(requestApproval).not.toHaveBeenCalled();
  });

  it('reads current grants instead of prompting again after approval', async () => {
    let grantedCapabilities: string[] = [];
    const requestApproval = jest.fn().mockResolvedValue(['camera']);
    const policy = createFrontComponentMediaCapabilityPolicy({
      getGrantedCapabilities: () => grantedCapabilities,
      requestApproval,
    });

    await policy({ mediaTypes: ['video'], abortSignal });
    grantedCapabilities = ['camera'];
    await expect(
      policy({ mediaTypes: ['video'], abortSignal }),
    ).resolves.toBeNull();

    expect(requestApproval).toHaveBeenCalledTimes(1);
  });
});
