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
export { setFrontComponentExecutionContext } from './context/frontComponentContext';
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
export { getFrontComponentCommandErrorDedupeKey } from './utils/getFrontComponentCommandErrorDedupeKey';
export {
  frontComponentHostCommunicationApi,
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

export { ALLOWED_HTML_ELEMENTS } from './constants/AllowedHtmlElements';
export type { AllowedHtmlElement } from './constants/AllowedHtmlElements';
export { COMMON_HTML_EVENTS } from './constants/CommonHtmlEvents';
export { EVENT_TO_REACT } from './constants/EventToReact';
export { HTML_COMMON_PROPERTIES } from './constants/HtmlCommonProperties';
export {
  HTML_TAG_TO_REMOTE_COMPONENT,
  HTML_TAG_TO_CUSTOM_ELEMENT_TAG,
} from './constants/HtmlTagToRemoteComponent';
export type { PropertySchema } from './types/PropertySchema';
export type { SerializedEventData } from './constants/SerializedEventData';
