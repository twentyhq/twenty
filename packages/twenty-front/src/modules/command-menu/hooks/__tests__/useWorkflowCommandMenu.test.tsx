import { renderHook } from '@testing-library/react';
import { useRecoilValue } from 'recoil';

import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/command-menu/pages/record-page/states/viewableRecordNameSingularComponentState';
import { commandMenuWorkflowIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowIdComponentState';
import { commandMenuNavigationMorphItemByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { t } from '@lingui/core/macro';
import { act } from 'react';
import { IconBolt, IconSettingsAutomation, useIcons } from 'twenty-ui/display';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { useWorkflowCommandMenu } from '../useWorkflowCommandMenu';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

const mockNavigateCommandMenu = jest.fn();
jest.mock('@/command-menu/hooks/useNavigateCommandMenu', () => ({
  useNavigateCommandMenu: () => ({
    navigateCommandMenu: mockNavigateCommandMenu,
  }),
}));

const workflowMockObjectMetadataItem = generatedMockObjectMetadataItems.find(
  (item) => item.nameSingular === 'workflow',
)!;

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: jest.fn(() => ({
    objectMetadataItem: workflowMockObjectMetadataItem,
  })),
}));

const wrapper = getJestMetadataAndApolloMocksAndActionMenuWrapper({
  apolloMocks: [],
  componentInstanceId: COMMAND_MENU_COMPONENT_INSTANCE_ID,
  contextStoreCurrentObjectMetadataNameSingular:
    workflowMockObjectMetadataItem.nameSingular,
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
      const {
        openWorkflowTriggerTypeInCommandMenu,
        openStepSelectInCommandMenu,
        openWorkflowEditStepInCommandMenu,
        openWorkflowViewStepInCommandMenu,
      } = useWorkflowCommandMenu();
      const commandMenuPage = useRecoilValue(commandMenuPageState);
      const commandMenuNavigationMorphItemByPage = useRecoilValue(
        commandMenuNavigationMorphItemByPageState,
      );

      const viewableRecordId = useRecoilComponentValueV2(
        viewableRecordIdComponentState,
        'mocked-uuid',
      );
      const viewableRecordNameSingular = useRecoilComponentValueV2(
        viewableRecordNameSingularComponentState,
        'mocked-uuid',
      );
      const currentObjectMetadataItemId = useRecoilComponentValueV2(
        contextStoreCurrentObjectMetadataItemIdComponentState,
        'mocked-uuid',
      );
      const targetedRecordsRule = useRecoilComponentValueV2(
        contextStoreTargetedRecordsRuleComponentState,
        'mocked-uuid',
      );
      const numberOfSelectedRecords = useRecoilComponentValueV2(
        contextStoreNumberOfSelectedRecordsComponentState,
        'mocked-uuid',
      );
      const currentViewType = useRecoilComponentValueV2(
        contextStoreCurrentViewTypeComponentState,
        'mocked-uuid',
      );
      const workflowId = useRecoilComponentValueV2(
        commandMenuWorkflowIdComponentState,
        'mocked-uuid',
      );
      const { getIcon } = useIcons();

      return {
        openWorkflowTriggerTypeInCommandMenu,
        openStepSelectInCommandMenu,
        openWorkflowEditStepInCommandMenu,
        openWorkflowViewStepInCommandMenu,
        workflowId,
        viewableRecordId,
        commandMenuPage,
        commandMenuNavigationMorphItemByPage,
        viewableRecordNameSingular,
        currentObjectMetadataItemId,
        targetedRecordsRule,
        numberOfSelectedRecords,
        currentViewType,
        getIcon,
      };
    },
    {
      wrapper,
    },
  );
  return { result };
};

describe('useWorkflowCommandMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should navigate to the workflow step select trigger type page', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.openWorkflowTriggerTypeInCommandMenu('test-workflow-id');
    });

    expect(result.current.workflowId).toBe('test-workflow-id');

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: CommandMenuPages.WorkflowStepSelectTriggerType,
      pageTitle: t`Trigger Type`,
      pageIcon: IconBolt,
      pageId: 'mocked-uuid',
    });
  });

  it('should navigate to the workflow step select action page', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.openStepSelectInCommandMenu('test-workflow-id');
    });

    expect(result.current.workflowId).toBe('test-workflow-id');

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: CommandMenuPages.WorkflowStepSelectAction,
      pageTitle: t`Select Action`,
      pageIcon: IconSettingsAutomation,
      pageId: 'mocked-uuid',
    });
  });

  it('should navigate to the workflow step edit page', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.openWorkflowEditStepInCommandMenu(
        'test-workflow-id',
        'Edit Step',
        IconSettingsAutomation,
      );
    });

    expect(result.current.workflowId).toBe('test-workflow-id');

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: CommandMenuPages.WorkflowStepEdit,
      pageTitle: 'Edit Step',
      pageIcon: IconSettingsAutomation,
      pageId: 'mocked-uuid',
    });
  });

  it('should navigate to the workflow step view page', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.openWorkflowViewStepInCommandMenu(
        'test-workflow-id',
        'View Step',
        IconSettingsAutomation,
      );
    });

    expect(result.current.workflowId).toBe('test-workflow-id');

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: CommandMenuPages.WorkflowStepView,
      pageTitle: 'View Step',
      pageIcon: IconSettingsAutomation,
      pageId: 'mocked-uuid',
    });
  });
});
