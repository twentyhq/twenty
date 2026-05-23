import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';

import { useFrontComponentExecutionContext } from '@/front-components/hooks/useFrontComponentExecutionContext';

const mockNavigateApp = jest.fn();
const mockRequestAccessTokenRefresh = jest.fn();
const mockOpenConfirmationModal = jest.fn();
const mockNavigateSidePanel = jest.fn();
const mockSetSidePanelSearch = jest.fn();
const mockGetIcon = jest.fn((name: string) => `icon-${name}`);
const mockUnmountEngineCommand = jest.fn();
const mockEnqueueSuccessSnackBar = jest.fn();
const mockEnqueueErrorSnackBar = jest.fn();
const mockEnqueueInfoSnackBar = jest.fn();
const mockEnqueueWarningSnackBar = jest.fn();
const mockCloseSidePanelMenu = jest.fn();
const mockSetCommandMenuItemProgress = jest.fn();
const mockCopyToClipboard = jest.fn();

let mockCurrentUser: { id: string } | null = { id: 'user-123' };

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => mockNavigateApp,
}));

jest.mock('@/front-components/hooks/useRequestApplicationTokenRefresh', () => ({
  useRequestApplicationTokenRefresh: () => ({
    requestAccessTokenRefresh: mockRequestAccessTokenRefresh,
  }),
}));

jest.mock(
  '@/command-menu-item/confirmation-modal/hooks/useCommandMenuConfirmationModal',
  () => ({
    useCommandMenuConfirmationModal: () => ({
      openConfirmationModal: mockOpenConfirmationModal,
    }),
  }),
);

jest.mock('@/side-panel/hooks/useNavigateSidePanel', () => ({
  useNavigateSidePanel: () => ({
    navigateSidePanel: mockNavigateSidePanel,
  }),
}));

jest.mock(
  '@/command-menu-item/engine-command/hooks/useUnmountEngineCommand',
  () => ({
    useUnmountCommand: () => mockUnmountEngineCommand,
  }),
);

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({
    enqueueSuccessSnackBar: mockEnqueueSuccessSnackBar,
    enqueueErrorSnackBar: mockEnqueueErrorSnackBar,
    enqueueInfoSnackBar: mockEnqueueInfoSnackBar,
    enqueueWarningSnackBar: mockEnqueueWarningSnackBar,
  }),
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    closeSidePanelMenu: mockCloseSidePanelMenu,
  }),
}));

jest.mock('twenty-ui/display', () => ({
  useIcons: () => ({
    getIcon: mockGetIcon,
  }),
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => mockCurrentUser,
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomState', () => ({
  useSetAtomState: () => mockSetSidePanelSearch,
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState', () => ({
  useSetAtomFamilyState: () => mockSetCommandMenuItemProgress,
}));

jest.mock('~/hooks/useCopyToClipboard', () => ({
  useCopyToClipboard: () => ({
    copyToClipboard: mockCopyToClipboard,
  }),
}));

const renderUseFrontComponentExecutionContext = (
  params: Parameters<typeof useFrontComponentExecutionContext>[0],
) =>
  renderHook(() => useFrontComponentExecutionContext(params), {
    wrapper: ({ children }) => I18nProvider({ i18n, children }),
  });

const FRONT_COMPONENT_ID = 'fc-test-id';
const COMMAND_MENU_ITEM_ID = 'cmd-item-1';

describe('useFrontComponentExecutionContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = { id: 'user-123' };
  });

  describe('executionContext', () => {
    it('should return frontComponentId, userId, recordId, and selectedRecordIds with single record', () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
        selectedRecordIds: ['record-456'],
      });

      expect(result.current.executionContext).toEqual({
        frontComponentId: FRONT_COMPONENT_ID,
        userId: 'user-123',
        recordId: 'record-456',
        selectedRecordIds: ['record-456'],
      });
    });

    it('should return null recordId when multiple selectedRecordIds provided', () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
        selectedRecordIds: ['record-1', 'record-2', 'record-3'],
      });

      expect(result.current.executionContext).toEqual({
        frontComponentId: FRONT_COMPONENT_ID,
        userId: 'user-123',
        recordId: null,
        selectedRecordIds: ['record-1', 'record-2', 'record-3'],
      });
    });

    it('should return null userId when no current user', () => {
      mockCurrentUser = null;

      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      expect(result.current.executionContext.userId).toBeNull();
    });

    it('should return null recordId and empty selectedRecordIds when no selectedRecordIds provided', () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      expect(result.current.executionContext.recordId).toBeNull();
      expect(result.current.executionContext.selectedRecordIds).toEqual([]);
    });

    it('should return null recordId and empty selectedRecordIds when empty array provided', () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
        selectedRecordIds: [],
      });

      expect(result.current.executionContext.recordId).toBeNull();
      expect(result.current.executionContext.selectedRecordIds).toEqual([]);
    });
  });

  describe('navigate', () => {
    it('should call navigateApp with the provided arguments', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.navigate(
          '/settings' as never,
          { id: '1' } as never,
          { tab: 'general' } as never,
          { replace: true } as never,
        );
      });

      expect(mockNavigateApp).toHaveBeenCalledWith(
        '/settings',
        { id: '1' },
        { tab: 'general' },
        { replace: true },
      );
    });
  });

  describe('openSidePanelPage', () => {
    it('should call navigateSidePanel with resolved icon', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.openSidePanelPage(
          {
            page: '/side-panel-page' as never,
            pageTitle: 'My Page',
            pageIcon: 'IconSettings',
            shouldResetSearchState: false,
          },
        );
      });

      expect(mockNavigateSidePanel).toHaveBeenCalledWith({
        page: '/side-panel-page',
        pageTitle: 'My Page',
        pageIcon: 'icon-IconSettings',
      });

      expect(mockSetSidePanelSearch).not.toHaveBeenCalled();
    });

    it('should reset side panel search state when shouldResetSearchState is true', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.openSidePanelPage(
          {
            page: '/page' as never,
            pageTitle: 'Title',
            pageIcon: 'IconSearch',
            shouldResetSearchState: true,
          },
        );
      });

      expect(mockSetSidePanelSearch).toHaveBeenCalledWith('');
    });
  });

  describe('openCommandConfirmationModal', () => {
    it('should call openConfirmationModal with frontComponent caller', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.openCommandConfirmationModal(
          {
            title: 'Confirm?',
            subtitle: 'Are you sure?',
            confirmButtonText: 'Yes',
            confirmButtonAccent: 'danger' as never,
          },
        );
      });

      expect(mockOpenConfirmationModal).toHaveBeenCalledWith({
        caller: {
          type: 'frontComponent',
          frontComponentId: FRONT_COMPONENT_ID,
        },
        title: 'Confirm?',
        subtitle: 'Are you sure?',
        confirmButtonText: 'Yes',
        confirmButtonAccent: 'danger',
      });
    });
  });

  describe('enqueueSnackbar', () => {
    it.each([
      { variant: 'success' as const, mock: () => mockEnqueueSuccessSnackBar },
      { variant: 'error' as const, mock: () => mockEnqueueErrorSnackBar },
      { variant: 'info' as const, mock: () => mockEnqueueInfoSnackBar },
      { variant: 'warning' as const, mock: () => mockEnqueueWarningSnackBar },
    ])(
      'should route $variant snackbar to the correct handler',
      async ({ variant, mock }) => {
        const { result } = renderUseFrontComponentExecutionContext({
          frontComponentId: FRONT_COMPONENT_ID,
        });

        await act(async () => {
          await result.current.frontComponentHostCommunicationApi.enqueueSnackbar(
            {
              message: `${variant} message`,
              variant,
              duration: 3000,
              detailedMessage: 'details',
              dedupeKey: 'key-1',
            },
          );
        });

        expect(mock()).toHaveBeenCalledWith({
          message: `${variant} message`,
          options: {
            duration: 3000,
            detailedMessage: 'details',
            dedupeKey: 'key-1',
          },
        });
      },
    );
  });

  describe('unmountFrontComponent', () => {
    it('should call unmountEngineCommand when commandMenuItemId is provided', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
        commandMenuItemId: COMMAND_MENU_ITEM_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.unmountFrontComponent();
      });

      expect(mockUnmountEngineCommand).toHaveBeenCalledWith(
        COMMAND_MENU_ITEM_ID,
      );
    });

    it('should not call unmountEngineCommand when commandMenuItemId is undefined', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.unmountFrontComponent();
      });

      expect(mockUnmountEngineCommand).not.toHaveBeenCalled();
    });
  });

  describe('closeSidePanel', () => {
    it('should call closeSidePanelMenu', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.closeSidePanel();
      });

      expect(mockCloseSidePanelMenu).toHaveBeenCalled();
    });
  });

  describe('updateProgress', () => {
    it('should set clamped progress when commandMenuItemId is provided', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
        commandMenuItemId: COMMAND_MENU_ITEM_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.updateProgress(
          50,
        );
      });

      expect(mockSetCommandMenuItemProgress).toHaveBeenCalledWith(50);
    });

    it('should clamp progress to 0 when negative value is provided', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
        commandMenuItemId: COMMAND_MENU_ITEM_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.updateProgress(
          -10,
        );
      });

      expect(mockSetCommandMenuItemProgress).toHaveBeenCalledWith(0);
    });

    it('should clamp progress to 100 when value exceeds 100', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
        commandMenuItemId: COMMAND_MENU_ITEM_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.updateProgress(
          150,
        );
      });

      expect(mockSetCommandMenuItemProgress).toHaveBeenCalledWith(100);
    });
  });

  describe('copyToClipboard', () => {
    it('should call useCopyToClipboard with the provided text and a preview message', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.copyToClipboard(
          'hello clipboard',
        );
      });

      expect(mockCopyToClipboard).toHaveBeenCalledWith(
        'hello clipboard',
        'Application copied "hello clipboard" to your clipboard',
      );
    });

    it('should truncate the preview when the text is longer than the preview length', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      const longText = 'a'.repeat(50);

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.copyToClipboard(
          longText,
        );
      });

      expect(mockCopyToClipboard).toHaveBeenCalledWith(
        longText,
        `Application copied "${'a'.repeat(30)}…" to your clipboard`,
      );
    });

    it.each([
      ['empty string', ''],
      ['number', 123],
      ['object', { malicious: true }],
      ['undefined', undefined],
      ['null', null],
    ])('should silently drop non-string payloads (%s)', async (_, value) => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.copyToClipboard(
          value as never,
        );
      });

      expect(mockCopyToClipboard).not.toHaveBeenCalled();
    });

    it('should silently drop payloads exceeding the maximum length', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      const oversizedPayload = 'a'.repeat(64 * 1024 + 1);

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.copyToClipboard(
          oversizedPayload,
        );
      });

      expect(mockCopyToClipboard).not.toHaveBeenCalled();
    });

    it('should rate-limit consecutive calls within one second', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.copyToClipboard(
          'first',
        );
        await result.current.frontComponentHostCommunicationApi.copyToClipboard(
          'second',
        );
      });

      expect(mockCopyToClipboard).toHaveBeenCalledTimes(1);
      expect(mockCopyToClipboard).toHaveBeenCalledWith(
        'first',
        expect.stringContaining('first'),
      );
    });

    it('should allow a follow-up call once the rate-limit window has passed', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      let currentTimeMs = 0;
      const dateNowSpy = jest
        .spyOn(Date, 'now')
        .mockImplementation(() => currentTimeMs);

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.copyToClipboard(
          'first',
        );
      });

      currentTimeMs = 1500;

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.copyToClipboard(
          'second',
        );
      });

      expect(mockCopyToClipboard).toHaveBeenCalledTimes(2);
      expect(mockCopyToClipboard).toHaveBeenNthCalledWith(
        1,
        'first',
        expect.stringContaining('first'),
      );
      expect(mockCopyToClipboard).toHaveBeenNthCalledWith(
        2,
        'second',
        expect.stringContaining('second'),
      );

      dateNowSpy.mockRestore();
    });
  });
});
