import { type Meta } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { type FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

export const errorHandler = fn();

export const hostApiMocks = {
  navigate: fn().mockResolvedValue(undefined),
  enqueueSnackbar: fn().mockResolvedValue(undefined),
  openSidePanelPage: fn().mockResolvedValue(undefined),
  closeSidePanel: fn().mockResolvedValue(undefined),
  unmountFrontComponent: fn().mockResolvedValue(undefined),
  updateProgress: fn().mockResolvedValue(undefined),
  requestAccessTokenRefresh: fn().mockResolvedValue('refreshed-token'),
  openCommandConfirmationModal: fn().mockResolvedValue(undefined),
  copyToClipboard: fn().mockResolvedValue(undefined),
  readFrontComponentFile: fn().mockResolvedValue(null),
};

export const FRONT_COMPONENT_STORY_DEFAULT_ARGS: NonNullable<
  Meta<typeof FrontComponentRenderer>['args']
> = {
  onError: errorHandler,
  applicationAccessToken: 'fake-token',
  executionContext: {
    frontComponentId: 'unset',
    userId: null,
    recordId: null,
    selectedRecordIds: [],
    colorScheme: 'Light',
  },
  colorScheme: 'light',
  frontComponentHostCommunicationApi: hostApiMocks,
};

export const resetFrontComponentStoryMocks = () => {
  errorHandler.mockClear();
  hostApiMocks.navigate.mockClear();
  hostApiMocks.enqueueSnackbar.mockClear();
  hostApiMocks.openSidePanelPage.mockClear();
  hostApiMocks.closeSidePanel.mockClear();
  hostApiMocks.unmountFrontComponent.mockClear();
  hostApiMocks.updateProgress.mockClear();
  hostApiMocks.requestAccessTokenRefresh.mockClear();
  hostApiMocks.openCommandConfirmationModal.mockClear();
  hostApiMocks.copyToClipboard.mockClear();
  hostApiMocks.readFrontComponentFile.mockClear();
};
