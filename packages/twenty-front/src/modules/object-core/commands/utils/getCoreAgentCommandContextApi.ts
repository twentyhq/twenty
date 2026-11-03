import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import {
  ContextStorePageType,
  type CommandMenuContextApi,
} from 'twenty-shared/types';

export const getCoreAgentCommandContextApi = (
  context: CommandMenuContextApi,
): CommandMenuContextApi => ({
  ...context,
  pageType: ContextStorePageType.Standalone,
  objectMetadataItem: {},
  objectMetadataLabel: '',
  objectPermissions: EMPTY_COMMAND_MENU_CONTEXT_API.objectPermissions,
  selectedRecords: [],
  numberOfSelectedRecords: 0,
  isSelectAll: false,
  favoriteRecordIds: [],
  hasAnySoftDeleteFilterOnView: false,
  isDashboardPageLayoutInEditMode: false,
});
