import { renderHook } from '@testing-library/react';

import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';
import { viewableRecordNameSingularComponentState } from '@/side-panel/pages/record-page/states/viewableRecordNameSingularComponentState';
import { sidePanelWorkflowIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowIdComponentState';
import { sidePanelWorkflowVersionIdComponentState } from '@/side-panel/pages/workflow/states/sidePanelWorkflowVersionIdComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { act } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconBolt, IconSettingsAutomation, useIcons } from 'twenty-ui/display';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('mocked-uuid'),
}));

const mockNavigateCommandMenu = jest.fn();
jest.mock('@/side-panel/hooks/useNavigateSidePanel', () => ({
  useNavigateSidePanel: () => ({
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
        openWorkflowCreateStepInCommandMenu,
        openWorkflowEditStepInCommandMenu,
        openWorkflowEditStepTypeInCommandMenu,
        openWorkflowViewStepInCommandMenu,
      } = useWorkflowCommandMenu();

      const viewableRecordNameSingular = useAtomComponentStateValue(
        viewableRecordNameSingularComponentState,
        'mocked-uuid',
      );
      const contextStoreCurrentObjectMetadataItemId =
        useAtomComponentStateValue(
          contextStoreCurrentObjectMetadataItemIdComponentState,
          'mocked-uuid',
        );
      const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
        contextStoreTargetedRecordsRuleComponentState,
        'mocked-uuid',
      );
      const contextStoreNumberOfSelectedRecords = useAtomComponentStateValue(
        contextStoreNumberOfSelectedRecordsComponentState,
        'mocked-uuid',
      );
      const contextStoreCurrentViewType = useAtomComponentStateValue(
        contextStoreCurrentViewTypeComponentState,
        'mocked-uuid',
      );
      const sidePanelWorkflowId = useAtomComponentStateValue(
        sidePanelWorkflowIdComponentState,
        'mocked-uuid',
      );
      const sidePanelWorkflowVersionId = useAtomComponentStateValue(
        sidePanelWorkflowVersionIdComponentState,
        'mocked-uuid',
      );
      const { getIcon } = useIcons();

      return {
        openWorkflowTriggerTypeInCommandMenu,
        openWorkflowCreateStepInCommandMenu,
        openWorkflowEditStepInCommandMenu,
        openWorkflowEditStepTypeInCommandMenu,
        openWorkflowViewStepInCommandMenu,
        sidePanelWorkflowId,
        sidePanelWorkflowVersionId,
        viewableRecordNameSingular,
        contextStoreCurrentObjectMetadataItemId,
        contextStoreTargetedRecordsRule,
        contextStoreNumberOfSelectedRecords,
        contextStoreCurrentViewType,
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

    expect(result.current.sidePanelWorkflowId).toBe('test-workflow-id');

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: SidePanelPages.WorkflowTriggerSelectType,
      pageTitle: t`Trigger Type`,
      pageIcon: IconBolt,
      pageId: 'mocked-uuid',
    });
  });

  it('should navigate to the workflow step create action page', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.openWorkflowCreateStepInCommandMenu('test-workflow-id');
    });

    expect(result.current.sidePanelWorkflowId).toBe('test-workflow-id');

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: SidePanelPages.WorkflowStepCreate,
      pageTitle: t`Select Action`,
      pageIcon: IconSettingsAutomation,
      pageId: 'mocked-uuid',
    });
  });

  it('should navigate to the workflow step edit type page', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.openWorkflowEditStepTypeInCommandMenu('test-workflow-id');
    });

    expect(result.current.sidePanelWorkflowId).toBe('test-workflow-id');

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: SidePanelPages.WorkflowStepEditType,
      pageTitle: t`Select action`,
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

    expect(result.current.sidePanelWorkflowId).toBe('test-workflow-id');

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: SidePanelPages.WorkflowStepEdit,
      pageTitle: 'Edit Step',
      pageIcon: IconSettingsAutomation,
      pageId: 'mocked-uuid',
    });
  });

  it('should navigate to the workflow step view page', () => {
    const { result } = renderHooks();

    act(() => {
      result.current.openWorkflowViewStepInCommandMenu({
        workflowId: 'test-workflow-id',
        workflowVersionId: 'test-workflow-version-id',
        icon: IconSettingsAutomation,
        title: 'View Step',
      });
    });

    expect(result.current.sidePanelWorkflowId).toBe('test-workflow-id');
    expect(result.current.sidePanelWorkflowVersionId).toBe(
      'test-workflow-version-id',
    );

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: SidePanelPages.WorkflowStepView,
      pageTitle: 'View Step',
      pageIcon: IconSettingsAutomation,
      pageId: 'mocked-uuid',
    });
  });
});
