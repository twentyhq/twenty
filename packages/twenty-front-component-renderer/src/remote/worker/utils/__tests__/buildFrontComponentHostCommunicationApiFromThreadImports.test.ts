import { type FrontComponentHostThreadExports } from '@/types/FrontComponentHostThreadExports';
import { buildFrontComponentHostCommunicationApiFromThreadImports } from '../buildFrontComponentHostCommunicationApiFromThreadImports';
import { handleCommandConfirmationModalResult } from '../createCommandConfirmationModalBridge';

const createHostThreadImportsStub = () =>
  ({
    navigate: jest.fn(),
    requestAccessTokenRefresh: jest.fn(),
    openSidePanelPage: jest.fn(),
    openCommandConfirmationModal: jest.fn(async () => {}),
    unmountFrontComponent: jest.fn(),
    enqueueSnackbar: jest.fn(),
    closeSidePanel: jest.fn(),
    updateProgress: jest.fn(),
    copyToClipboard: jest.fn(),
    startMediaRecording: jest.fn(),
    stopMediaRecording: jest.fn(),
    cancelMediaRecording: jest.fn(),
    storageSet: jest.fn(),
    storageDelete: jest.fn(),
    storageClear: jest.fn(),
    hostFetch: jest.fn(),
  }) as unknown as FrontComponentHostThreadExports;

describe('buildFrontComponentHostCommunicationApiFromThreadImports', () => {
  afterEach(async () => {
    await handleCommandConfirmationModalResult('cancel');
  });

  it('should map every host api member onto the communication api', () => {
    const hostThreadImports = createHostThreadImportsStub();

    const hostCommunicationApi =
      buildFrontComponentHostCommunicationApiFromThreadImports(
        hostThreadImports,
      );

    expect(Object.keys(hostCommunicationApi).sort()).toEqual([
      'cancelMediaRecording',
      'closeSidePanel',
      'copyToClipboard',
      'enqueueSnackbar',
      'navigate',
      'openCommandConfirmationModal',
      'openSidePanelPage',
      'requestAccessTokenRefresh',
      'startMediaRecording',
      'stopMediaRecording',
      'storageClear',
      'storageDelete',
      'storageSet',
      'unmountFrontComponent',
      'updateProgress',
    ]);
    expect(hostCommunicationApi.navigate).toBe(hostThreadImports.navigate);
    expect(hostCommunicationApi.requestAccessTokenRefresh).toBe(
      hostThreadImports.requestAccessTokenRefresh,
    );
    expect(hostCommunicationApi.openSidePanelPage).toBe(
      hostThreadImports.openSidePanelPage,
    );
    expect(hostCommunicationApi.unmountFrontComponent).toBe(
      hostThreadImports.unmountFrontComponent,
    );
    expect(hostCommunicationApi.enqueueSnackbar).toBe(
      hostThreadImports.enqueueSnackbar,
    );
    expect(hostCommunicationApi.closeSidePanel).toBe(
      hostThreadImports.closeSidePanel,
    );
    expect(hostCommunicationApi.updateProgress).toBe(
      hostThreadImports.updateProgress,
    );
    expect(hostCommunicationApi.copyToClipboard).toBe(
      hostThreadImports.copyToClipboard,
    );
    expect(hostCommunicationApi.startMediaRecording).toBe(
      hostThreadImports.startMediaRecording,
    );
    expect(hostCommunicationApi.stopMediaRecording).toBe(
      hostThreadImports.stopMediaRecording,
    );
    expect(hostCommunicationApi.cancelMediaRecording).toBe(
      hostThreadImports.cancelMediaRecording,
    );
    expect(hostCommunicationApi.storageSet).toBe(hostThreadImports.storageSet);
    expect(hostCommunicationApi.storageDelete).toBe(
      hostThreadImports.storageDelete,
    );
    expect(hostCommunicationApi.storageClear).toBe(
      hostThreadImports.storageClear,
    );
  });

  it('should wrap openCommandConfirmationModal with the confirmation modal adapter', async () => {
    const hostThreadImports = createHostThreadImportsStub();

    const hostCommunicationApi =
      buildFrontComponentHostCommunicationApiFromThreadImports(
        hostThreadImports,
      );

    expect(hostCommunicationApi.openCommandConfirmationModal).not.toBe(
      hostThreadImports.openCommandConfirmationModal,
    );

    const confirmationResultPromise =
      hostCommunicationApi.openCommandConfirmationModal(
        {} as Parameters<
          typeof hostCommunicationApi.openCommandConfirmationModal
        >[0],
      );

    expect(hostThreadImports.openCommandConfirmationModal).toHaveBeenCalled();

    await handleCommandConfirmationModalResult('confirm');
    await expect(confirmationResultPromise).resolves.toBe('confirm');
  });
});
