import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook } from '@testing-library/react';
import { getDefaultStore } from 'jotai';
import { AppPath, SidePanelPages } from 'twenty-shared/types';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreRecordShowParentViewComponentState } from '@/context-store/states/contextStoreRecordShowParentViewComponentState';
import { useFrontComponentExecutionContext } from '@/front-components/hooks/useFrontComponentExecutionContext';

const mockNavigateApp = jest.fn();
const mockRequestAccessTokenRefresh = jest.fn();
const mockOpenConfirmationModal = jest.fn();
const mockNavigateSidePanel = jest.fn();
const mockOpenRecordInSidePanel = jest.fn();
const mockOpenRichTextInSidePanel = jest.fn();
const mockOpenComposeEmailInSidePanel = jest.fn();
const mockOpenFrontComponentInSidePanel = jest.fn();
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
let mockIsMobile = false;

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

jest.mock('@/side-panel/hooks/useOpenRecordInSidePanel', () => ({
  useOpenRecordInSidePanel: () => ({
    openRecordInSidePanel: mockOpenRecordInSidePanel,
  }),
}));

jest.mock('@/side-panel/hooks/useOpenRichTextInSidePanel', () => ({
  useOpenRichTextInSidePanel: () => ({
    openRichTextInSidePanel: mockOpenRichTextInSidePanel,
  }),
}));

jest.mock('@/side-panel/hooks/useOpenComposeEmailInSidePanel', () => ({
  useOpenComposeEmailInSidePanel: () => ({
    openComposeEmailInSidePanel: mockOpenComposeEmailInSidePanel,
  }),
}));

jest.mock('@/side-panel/hooks/useOpenFrontComponentInSidePanel', () => ({
  useOpenFrontComponentInSidePanel: () => ({
    openFrontComponentInSidePanel: mockOpenFrontComponentInSidePanel,
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

jest.mock('twenty-ui/icon', () => ({
  useIcons: () => ({
    getIcon: mockGetIcon,
  }),
}));

jest.mock('twenty-ui/utilities', () => ({
  useIsMobile: () => mockIsMobile,
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
  params: Omit<
    Parameters<typeof useFrontComponentExecutionContext>[0],
    'colorScheme'
  > & { colorScheme?: 'light' | 'dark' },
) =>
  renderHook(
    () =>
      useFrontComponentExecutionContext({ colorScheme: 'light', ...params }),
    {
      wrapper: ({ children }) => I18nProvider({ i18n, children }),
    },
  );

const FRONT_COMPONENT_ID = 'fc-test-id';
const COMMAND_MENU_ITEM_ID = 'cmd-item-1';

const parentViewAtom =
  contextStoreRecordShowParentViewComponentState.atomFamily({
    instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
  });

const createParentView = (parentViewObjectNameSingular: string) => ({
  parentViewComponentId: 'parent-view-component-id',
  parentViewObjectNameSingular,
  parentViewFilterGroups: [],
  parentViewFilters: [],
  parentViewSorts: [],
});

describe('useFrontComponentExecutionContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCurrentUser = { id: 'user-123' };
    mockIsMobile = false;
    getDefaultStore().set(parentViewAtom, undefined);
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
        colorScheme: 'light',
        locale: i18n.locale,
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
        colorScheme: 'light',
        locale: i18n.locale,
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

    it('should expose the provided colorScheme', () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
        colorScheme: 'dark',
      });

      expect(result.current.executionContext.colorScheme).toBe('dark');
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

    it('should clear stale parent-view state when navigating to a record of a different object', async () => {
      const store = getDefaultStore();
      store.set(parentViewAtom, createParentView('company'));

      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.navigate(
          AppPath.RecordShowPage,
          { objectNameSingular: 'person', objectRecordId: 'record-1' },
        );
      });

      expect(store.get(parentViewAtom)).toBeUndefined();
      expect(mockNavigateApp).toHaveBeenCalledWith(
        AppPath.RecordShowPage,
        { objectNameSingular: 'person', objectRecordId: 'record-1' },
        undefined,
        undefined,
      );
    });

    it('should keep parent-view state when navigating to a record of the same object', async () => {
      const store = getDefaultStore();
      const parentView = createParentView('company');
      store.set(parentViewAtom, parentView);

      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.navigate(
          AppPath.RecordShowPage,
          { objectNameSingular: 'company', objectRecordId: 'record-2' },
        );
      });

      expect(store.get(parentViewAtom)).toEqual(parentView);
    });

    it('should keep parent-view state when navigating to a non-record page', async () => {
      const store = getDefaultStore();
      const parentView = createParentView('company');
      store.set(parentViewAtom, parentView);

      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.navigate(
          AppPath.SettingsCatchAll,
        );
      });

      expect(store.get(parentViewAtom)).toEqual(parentView);
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

  describe('openSidePanelPage with a record context', () => {
    it('should open the record in the side panel when the object is supported', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.openSidePanelPage(
          {
            page: SidePanelPages.ViewRecord,
            recordId: 'lead-1',
            objectNameSingular: 'lead',
            resetNavigationStack: true,
          },
        );
      });

      expect(mockOpenRecordInSidePanel).toHaveBeenCalledWith({
        recordId: 'lead-1',
        objectNameSingular: 'lead',
        resetNavigationStack: true,
      });
      expect(mockNavigateApp).not.toHaveBeenCalled();
      expect(mockNavigateSidePanel).not.toHaveBeenCalled();
    });

    it('should fall back to full-page navigation on mobile', async () => {
      mockIsMobile = true;

      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.openSidePanelPage(
          {
            page: SidePanelPages.ViewRecord,
            recordId: 'lead-1',
            objectNameSingular: 'lead',
          },
        );
      });

      expect(mockNavigateApp).toHaveBeenCalledWith(
        AppPath.RecordShowPage,
        { objectNameSingular: 'lead', objectRecordId: 'lead-1' },
        undefined,
        undefined,
      );
      expect(mockOpenRecordInSidePanel).not.toHaveBeenCalled();
    });

    it('should fall back to full-page navigation when the object cannot open in the side panel', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.openSidePanelPage(
          {
            page: SidePanelPages.ViewRecord,
            recordId: 'workflow-1',
            objectNameSingular: 'workflow',
          },
        );
      });

      expect(mockNavigateApp).toHaveBeenCalledWith(
        AppPath.RecordShowPage,
        { objectNameSingular: 'workflow', objectRecordId: 'workflow-1' },
        undefined,
        undefined,
      );
      expect(mockOpenRecordInSidePanel).not.toHaveBeenCalled();
    });
  });

  describe('openSidePanelPage with EditRichText', () => {
    it('should open the rich text editor for a record field', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.openSidePanelPage(
          {
            page: SidePanelPages.EditRichText,
            recordId: 'note-1',
            objectNameSingular: 'note',
            fieldName: 'body',
          },
        );
      });

      expect(mockOpenRichTextInSidePanel).toHaveBeenCalledWith(
        'note-1',
        'note',
        'body',
      );
    });
  });

  describe('openSidePanelPage with ComposeEmail', () => {
    it('should open the email composer with the provided params', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.openSidePanelPage(
          {
            page: SidePanelPages.ComposeEmail,
            connectedAccountId: 'account-1',
            defaultTo: 'lead@example.com',
            pageIcon: 'IconMail',
          },
        );
      });

      expect(mockOpenComposeEmailInSidePanel).toHaveBeenCalledWith({
        connectedAccountId: 'account-1',
        threadId: undefined,
        defaultTo: 'lead@example.com',
        defaultSubject: undefined,
        defaultInReplyTo: undefined,
        pageTitle: undefined,
        pageIcon: 'icon-IconMail',
      });
    });
  });

  describe('openSidePanelPage with ViewFrontComponent', () => {
    it('should open a front component with optional record context', async () => {
      const { result } = renderUseFrontComponentExecutionContext({
        frontComponentId: FRONT_COMPONENT_ID,
      });

      await act(async () => {
        await result.current.frontComponentHostCommunicationApi.openSidePanelPage(
          {
            page: SidePanelPages.ViewFrontComponent,
            frontComponentId: 'fc-1',
            pageTitle: 'My Component',
            pageIcon: 'IconBolt',
            recordId: 'lead-1',
            objectNameSingular: 'lead',
          },
        );
      });

      expect(mockOpenFrontComponentInSidePanel).toHaveBeenCalledWith({
        frontComponentId: 'fc-1',
        pageTitle: 'My Component',
        pageIcon: 'icon-IconBolt',
        resetNavigationStack: undefined,
        recordContext: { recordId: 'lead-1', objectNameSingular: 'lead' },
      });
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
