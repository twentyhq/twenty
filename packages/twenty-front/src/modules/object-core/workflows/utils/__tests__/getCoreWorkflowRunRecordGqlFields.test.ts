import { CoreObjectNameSingular } from 'twenty-shared/types';

import { getCoreWorkflowRunRecordGqlFields } from '@/object-core/workflows/utils/getCoreWorkflowRunRecordGqlFields';

describe('getCoreWorkflowRunRecordGqlFields', () => {
  it('should request the core workflow and version ids of workflow runs when the flag is on', () => {
    expect(
      getCoreWorkflowRunRecordGqlFields({
        objectNameSingular: CoreObjectNameSingular.WorkflowRun,
        isWorkflowCoreIndexPageEnabled: true,
      }),
    ).toEqual({ coreWorkflowId: true, coreWorkflowVersionId: true });
  });

  it('should request nothing more when the flag is off', () => {
    expect(
      getCoreWorkflowRunRecordGqlFields({
        objectNameSingular: CoreObjectNameSingular.WorkflowRun,
        isWorkflowCoreIndexPageEnabled: false,
      }),
    ).toEqual({});
  });

  it('should request nothing more for other objects when the flag is on', () => {
    expect(
      getCoreWorkflowRunRecordGqlFields({
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
        isWorkflowCoreIndexPageEnabled: true,
      }),
    ).toEqual({});
  });
});
