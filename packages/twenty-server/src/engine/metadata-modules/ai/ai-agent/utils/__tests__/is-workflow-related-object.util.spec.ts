import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';

import { isWorkflowRelatedObject } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-workflow-related-object.util';

describe('isWorkflowRelatedObject', () => {
  it('should return true for workflow-related objects', () => {
    expect(
      isWorkflowRelatedObject({
        universalIdentifier: STANDARD_OBJECT_IDS.workflow,
      }),
    ).toBe(true);

    expect(
      isWorkflowRelatedObject({
        universalIdentifier: STANDARD_OBJECT_IDS.workflowRun,
      }),
    ).toBe(true);

    expect(
      isWorkflowRelatedObject({
        universalIdentifier: STANDARD_OBJECT_IDS.workflowVersion,
      }),
    ).toBe(true);
  });

  it('should return false for non-workflow objects', () => {
    expect(
      isWorkflowRelatedObject({
        universalIdentifier: STANDARD_OBJECT_IDS.person,
      }),
    ).toBe(false);

    expect(
      isWorkflowRelatedObject({
        universalIdentifier: 'some-custom-object-uuid',
      }),
    ).toBe(false);
  });
});
