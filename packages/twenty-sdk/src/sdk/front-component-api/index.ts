export {
  isShowPage,
  isInSidePanel,
  isFavorite,
  isRemote,
  isNoteOrTask,
  isSelectAll,
  hasAnySoftDeleteFilterOnView,
  numberOfSelectedRecords,
  objectPermissions,
  selectedRecord,
  featureFlags,
  targetObjectReadPermissions,
  targetObjectWritePermissions,
  isDefined,
  isNonEmptyString,
} from './conditional-availability/conditional-availability-variables';
export { setFrontComponentExecutionContext } from './context/frontComponentContext';
export { closeSidePanel } from './functions/closeSidePanel';
export { enqueueSnackbar } from './functions/enqueueSnackbar';
export { navigate } from './functions/navigate';
export { openCommandConfirmationModal } from './functions/openCommandConfirmationModal';
export { openSidePanelPage } from './functions/openSidePanelPage';
export { unmountFrontComponent } from './functions/unmountFrontComponent';
export { useFrontComponentExecutionContext } from './hooks/useFrontComponentExecutionContext';
export { useFrontComponentId } from './hooks/useFrontComponentId';
export { useRecordId } from './hooks/useRecordId';
export { useUserId } from './hooks/useUserId';
export type { FrontComponentExecutionContext } from './types/FrontComponentExecutionContext';
export { getFrontComponentCommandErrorDedupeKey } from './utils/getFrontComponentCommandErrorDedupeKey';
export type {
  CommandConfirmationModalAccent,
  CommandConfirmationModalResult,
} from './globals/frontComponentHostCommunicationApi';

export { ALLOWED_HTML_ELEMENTS } from './constants/AllowedHtmlElements';
export type { AllowedHtmlElement } from './constants/AllowedHtmlElements';
export { COMMON_HTML_EVENTS } from './constants/CommonHtmlEvents';
export { EVENT_TO_REACT } from './constants/EventToReact';
export { HTML_COMMON_PROPERTIES } from './constants/HtmlCommonProperties';
export { HTML_TAG_TO_REMOTE_COMPONENT } from './constants/HtmlTagToRemoteComponent';
export type { SerializedEventData } from './constants/SerializedEventData';
