import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { getCoreAgentCommandContextApi } from '@/object-core/commands/utils/getCoreAgentCommandContextApi';
import { ContextStorePageType } from 'twenty-shared/types';

it('removes another surface record context while retaining actor and workspace capabilities', () => {
  const context = {
    ...EMPTY_COMMAND_MENU_CONTEXT_API,
    pageType: ContextStorePageType.Record,
    objectMetadataItem: { id: 'company-object' },
    objectMetadataLabel: 'Company',
    selectedRecords: [{ id: 'company-id' }],
    numberOfSelectedRecords: 1,
    favoriteRecordIds: ['company-id'],
    permissionFlags: { AI: true },
  };
  const result = getCoreAgentCommandContextApi(context);
  expect(result.pageType).toBe(ContextStorePageType.Standalone);
  expect(result.objectMetadataItem).toEqual({});
  expect(result.selectedRecords).toEqual([]);
  expect(result.numberOfSelectedRecords).toBe(0);
  expect(result.permissionFlags).toBe(context.permissionFlags);
  expect(context.selectedRecords).toEqual([{ id: 'company-id' }]);
});
