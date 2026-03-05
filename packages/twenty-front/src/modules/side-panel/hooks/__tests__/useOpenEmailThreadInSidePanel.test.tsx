import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { useOpenEmailThreadInSidePanel } from '@/side-panel/hooks/useOpenEmailThreadInSidePanel';
import { viewableRecordIdComponentState } from '@/side-panel/pages/record-page/states/viewableRecordIdComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { SidePanelPages } from 'twenty-shared/types';
import { IconMail } from 'twenty-ui/display';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

const mockNavigateSidePanel = jest.fn();
jest.mock('@/side-panel/hooks/useNavigateSidePanel', () => ({
  useNavigateSidePanel: () => ({
    navigateSidePanel: mockNavigateSidePanel,
  }),
}));

const personMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'person',
)!;

const wrapper = getJestMetadataAndApolloMocksAndActionMenuWrapper({
  apolloMocks: [],
  componentInstanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
  contextStoreCurrentObjectMetadataNameSingular:
    personMockObjectMetadataItem.nameSingular,
  contextStoreCurrentViewId: 'my-view-id',
  contextStoreTargetedRecordsRule: {
    mode: 'selection',
    selectedRecordIds: [],
  },
  contextStoreNumberOfSelectedRecords: 0,
  contextStoreCurrentViewType: ContextStoreViewType.Table,
});

const renderHooks = () => {
  const { result } = renderHook(
    () => {
      const { openEmailThreadInSidePanel } = useOpenEmailThreadInSidePanel();

      const viewableRecordId = useAtomComponentStateValue(
        viewableRecordIdComponentState,
        'mocked-uuid',
      );

      return {
        openEmailThreadInSidePanel,
        viewableRecordId,
      };
    },
    {
      wrapper,
    },
  );
  return { result };
};

describe('useOpenEmailThreadInSidePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set the correct states and navigate to the email thread page', () => {
    const { result } = renderHooks();

    const emailThreadId = 'email-thread-123';

    act(() => {
      result.current.openEmailThreadInSidePanel(emailThreadId);
    });

    expect(result.current.viewableRecordId).toBe(emailThreadId);

    expect(mockNavigateSidePanel).toHaveBeenCalledWith({
      page: SidePanelPages.ViewEmailThread,
      pageTitle: 'Email Thread',
      pageIcon: IconMail,
      pageId: 'mocked-uuid',
    });
  });
});
