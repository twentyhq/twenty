import { type HeadlessCommandContextApi } from '@/command-menu-item/engine-command/types/HeadlessCommandContextApi';
import { isHeadlessTriggerWorkflowVersionCommandContextApi } from '@/command-menu-item/engine-command/utils/isHeadlessTriggerWorkflowVersionCommandContextApi';
import { EngineComponentKey } from '~/generated-metadata/graphql';

const baseContextApi: HeadlessCommandContextApi = {
  engineComponentKey: EngineComponentKey.CREATE_NEW_RECORD,
  contextStoreInstanceId: 'ctx-1',
  objectMetadataItem: null,
  currentViewId: null,
  recordIndexId: null,
  targetedRecordsRule: { mode: 'selection', selectedRecordIds: [] },
  selectedRecords: [],
  graphqlFilter: null,
};

describe('isHeadlessTriggerWorkflowVersionCommandContextApi', () => {
  it('should return true when state has workflowId', () => {
    const triggerWorkflowContext: HeadlessCommandContextApi = {
      ...baseContextApi,
      workflowId: 'wf-1',
      workflowVersionId: 'wfv-1',
      payloads: [],
    };

    expect(
      isHeadlessTriggerWorkflowVersionCommandContextApi(triggerWorkflowContext),
    ).toBe(true);
  });

  it('should return false for plain HeadlessEngineCommandContextApi', () => {
    expect(
      isHeadlessTriggerWorkflowVersionCommandContextApi(baseContextApi),
    ).toBe(false);
  });

  it('should return false for HeadlessFrontComponentCommandContextApi', () => {
    const frontComponentContext: HeadlessCommandContextApi = {
      ...baseContextApi,
      frontComponentId: 'fc-1',
    };

    expect(
      isHeadlessTriggerWorkflowVersionCommandContextApi(frontComponentContext),
    ).toBe(false);
  });
});
