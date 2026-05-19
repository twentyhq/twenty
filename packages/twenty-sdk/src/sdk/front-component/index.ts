export {
  pageType,
  isInSidePanel,
  isDashboardPageLayoutInEditMode,
  isLayoutCustomizationModeEnabled,
  favoriteRecordIds,
  isSelectAll,
  hasAnySoftDeleteFilterOnView,
  numberOfSelectedRecords,
  objectPermissions,
  selectedRecords,
  featureFlags,
  targetObjectReadPermissions,
  targetObjectWritePermissions,
  isDefined,
  isNonEmptyString,
  includes,
  every,
  everyDefined,
  everyEquals,
  some,
  someDefined,
  someEquals,
  none,
  noneDefined,
  noneEquals,
  someNonEmptyString,
  includesEvery,
  objectMetadataItem,
} from './conditional-availability/conditional-availability-variables';
export { closeSidePanel } from './functions/closeSidePanel';
export { getApplicationVariable } from './functions/getApplicationVariable';
export { enqueueSnackbar } from './functions/enqueueSnackbar';
export { navigate } from './functions/navigate';
export { openCommandConfirmationModal } from './functions/openCommandConfirmationModal';
export { openSidePanelPage } from './functions/openSidePanelPage';
export { unmountFrontComponent } from './functions/unmountFrontComponent';
export { updateProgress } from './functions/updateProgress';
export { useFrontComponentExecutionContext } from './hooks/useFrontComponentExecutionContext';
export { useFrontComponentId } from './hooks/useFrontComponentId';
export { useRecordId } from './hooks/useRecordId';
export { useSelectedRecordIds } from './hooks/useSelectedRecordIds';
export { useUserId } from './hooks/useUserId';
export type { FrontComponentExecutionContext } from './types/FrontComponentExecutionContext';
export { getFrontComponentCommandErrorDedupeKey } from './utils/getFrontComponentCommandErrorDedupeKey';
export type {
  CloseSidePanelFunction,
  CommandConfirmationModalAccent,
  CommandConfirmationModalResult,
  EnqueueSnackbarFunction,
  NavigateFunction,
  OpenCommandConfirmationModalFunction,
  OpenCommandConfirmationModalHostFunction,
  OpenSidePanelPageFunction,
  RequestAccessTokenRefreshFunction,
  UnmountFrontComponentFunction,
  UpdateProgressFunction,
} from './globals/frontComponentHostCommunicationApi';

export {
  Command,
  CommandLink,
  CommandModal,
  CommandOpenSidePanelPage,
} from './command';
export type {
  CommandLinkProps,
  CommandModalProps,
  CommandOpenSidePanelPageProps,
  CommandProps,
} from './command';

export { AppPath, SidePanelPages } from 'twenty-shared/types';
export type {
  EnqueueSnackbarParams,
  SnackBarVariant,
} from 'twenty-shared/types';
