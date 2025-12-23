import { renderHook } from '@testing-library/react';
import { useRecoilValue } from 'recoil';

import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/command-menu/pages/record-page/states/viewableRecordNameSingularComponentState';
import { commandMenuWorkflowIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowIdComponentState';
import { commandMenuWorkflowVersionIdComponentState } from '@/command-menu/pages/workflow/states/commandMenuWorkflowVersionIdComponentState';
import { commandMenuNavigationMorphItemsByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsByPageState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { act } from 'react';
import { IconBolt, IconSettingsAutomation, useIcons } from 'twenty-ui/display';
import { getJestMetadataAndApolloMocksAndActionMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndActionMenuWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { useWorkflowCommandMenu } from '@/command-menu/hooks/useWorkflowCommandMenu';

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
        openWorkflowCreateStepInCommandMenu,
        openWorkflowEditStepInCommandMenu,
        openWorkflowEditStepTypeInCommandMenu,
        openWorkflowViewStepInCommandMenu,
      } = useWorkflowCommandMenu();
      const commandMenuPage = useRecoilValue(commandMenuPageState);
      const commandMenuNavigationMorphItemsByPage = useRecoilValue(
        commandMenuNavigationMorphItemsByPageState,
      );

      const viewableRecordId = useRecoilComponentValue(
        viewableRecordIdComponentState,
        'mocked-uuid',
      );
      const viewableRecordNameSingular = useRecoilComponentValue(
        viewableRecordNameSingularComponentState,
        'mocked-uuid',
      );
      const currentObjectMetadataItemId = useRecoilComponentValue(
        contextStoreCurrentObjectMetadataItemIdComponentState,
        'mocked-uuid',
      );
      const targetedRecordsRule = useRecoilComponentValue(
        contextStoreTargetedRecordsRuleComponentState,
        'mocked-uuid',
      );
      const numberOfSelectedRecords = useRecoilComponentValue(
        contextStoreNumberOfSelectedRecordsComponentState,
        'mocked-uuid',
      );
      const currentViewType = useRecoilComponentValue(
        contextStoreCurrentViewTypeComponentState,
        'mocked-uuid',
      );
      const workflowId = useRecoilComponentValue(
        commandMenuWorkflowIdComponentState,
        'mocked-uuid',
      );
      const workflowVersionId = useRecoilComponentValue(
        commandMenuWorkflowVersionIdComponentState,
        'mocked-uuid',
      );
      const { getIcon } = useIcons();

      return {
        openWorkflowTriggerTypeInCommandMenu,
        openWorkflowCreateStepInCommandMenu,
        openWorkflowEditStepInCommandMenu,
        openWorkflowEditStepTypeInCommandMenu,
        openWorkflowViewStepInCommandMenu,
        workflowId,
        workflowVersionId,
        viewableRecordId,
        commandMenuPage,
        commandMenuNavigationMorphItemsByPage,
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
      page: CommandMenuPages.WorkflowTriggerSelectType,
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

    expect(result.current.workflowId).toBe('test-workflow-id');

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: CommandMenuPages.WorkflowStepCreate,
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

    expect(result.current.workflowId).toBe('test-workflow-id');

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: CommandMenuPages.WorkflowStepEditType,
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
      result.current.openWorkflowViewStepInCommandMenu({
        workflowId: 'test-workflow-id',
        workflowVersionId: 'test-workflow-version-id',
        icon: IconSettingsAutomation,
        title: 'View Step',
      });
    });

    expect(result.current.workflowId).toBe('test-workflow-id');
    expect(result.current.workflowVersionId).toBe('test-workflow-version-id');

    expect(mockNavigateCommandMenu).toHaveBeenCalledWith({
      page: CommandMenuPages.WorkflowStepView,
      pageTitle: 'View Step',
      pageIcon: IconSettingsAutomation,
      pageId: 'mocked-uuid',
    });
  });
});
