export {
  pageType,
  isInSidePanel,
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
export { enqueueSnackbar } from './functions/enqueueSnackbar';
export { navigate } from './functions/navigate';
export { openCommandConfirmationModal } from './functions/openCommandConfirmationModal';
export { openSidePanelPage } from './functions/openSidePanelPage';
export { unmountFrontComponent } from './functions/unmountFrontComponent';
export { updateProgress } from './functions/updateProgress';
export { useFrontComponentExecutionContext } from './hooks/useFrontComponentExecutionContext';
export { useFrontComponentId } from './hooks/useFrontComponentId';
export { useRecordId } from './hooks/useRecordId';
export { useUserId } from './hooks/useUserId';
export type { FrontComponentExecutionContext } from './types/FrontComponentExecutionContext';
export {
  FRONT_COMPONENT_CONTEXT_KEY,
  FRONT_COMPONENT_LISTENERS_KEY,
} from './context/frontComponentContext';
export { getFrontComponentCommandErrorDedupeKey } from './utils/getFrontComponentCommandErrorDedupeKey';
export {
  FRONT_COMPONENT_HOST_COMMUNICATION_API_KEY,
} from './globals/frontComponentHostCommunicationApi';
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
