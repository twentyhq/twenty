import { SidePanelPages } from 'twenty-shared/types';

import { isInboxPickerRequestCurrent } from '@/side-panel/pages/search-ai-chats/utils/isInboxPickerRequestCurrent';
import { type SidePanelNavigationStackItem } from '@/side-panel/states/sidePanelNavigationStackState';

const PICKER_PAGE: SidePanelNavigationStackItem = {
  page: SidePanelPages.SearchAiChats,
  pageTitle: 'Open chat',
  pageIcon: () => null,
  pageId: 'chat-picker',
};

const CURRENT_REQUEST = {
  isSidePanelOpened: true,
  initialPage: PICKER_PAGE,
  currentPage: PICKER_PAGE,
  initialWorkspaceId: 'workspace',
  currentWorkspaceId: 'workspace',
};

describe('isInboxPickerRequestCurrent', () => {
  it('accepts a request while its picker and workspace are unchanged', () => {
    expect(isInboxPickerRequestCurrent(CURRENT_REQUEST)).toBe(true);
  });

  it.each([
    { reason: 'closed', changedState: { isSidePanelOpened: false } },
    {
      reason: 'replaced with the same page ID',
      changedState: { currentPage: { ...PICKER_PAGE } },
    },
    { reason: 'removed', changedState: { currentPage: undefined } },
    {
      reason: 'moved to another workspace',
      changedState: { currentWorkspaceId: 'another-workspace' },
    },
  ])('rejects a request after its picker is $reason', ({ changedState }) => {
    expect(
      isInboxPickerRequestCurrent({ ...CURRENT_REQUEST, ...changedState }),
    ).toBe(false);
  });
});
