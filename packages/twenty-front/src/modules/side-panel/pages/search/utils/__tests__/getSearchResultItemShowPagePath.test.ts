import { getSearchResultItemShowPagePath } from '@/side-panel/pages/search/utils/getSearchResultItemShowPagePath';

describe('getSearchResultItemShowPagePath', () => {
  it('opens a workflow on the core route when the core index page is enabled', () => {
    expect(
      getSearchResultItemShowPagePath({
        objectNameSingular: 'workflow',
        recordId: 'workspace-workflow-id',
        coreWorkflowId: 'core-workflow-id',
        isWorkflowCoreEnabled: true,
      }),
    ).toBe('/workflow-core/core-workflow-id');
  });

  it('keeps the workspace workflow route when the core index page is disabled', () => {
    expect(
      getSearchResultItemShowPagePath({
        objectNameSingular: 'workflow',
        recordId: 'workspace-workflow-id',
        coreWorkflowId: 'core-workflow-id',
        isWorkflowCoreEnabled: false,
      }),
    ).toBe('/object/workflow/workspace-workflow-id');
  });

  it('refuses to open a workflow without a core pointer in core mode', () => {
    expect(
      getSearchResultItemShowPagePath({
        objectNameSingular: 'workflow',
        recordId: 'workspace-workflow-id',
        coreWorkflowId: null,
        isWorkflowCoreEnabled: true,
      }),
    ).toBeNull();
  });

  it('leaves every other object on its record show page', () => {
    expect(
      getSearchResultItemShowPagePath({
        objectNameSingular: 'company',
        recordId: 'company-id',
        isWorkflowCoreEnabled: true,
      }),
    ).toBe('/object/company/company-id');
  });
});
