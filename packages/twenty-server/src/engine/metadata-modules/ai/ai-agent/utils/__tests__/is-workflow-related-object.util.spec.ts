import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { isWorkflowRelatedObject } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-workflow-related-object.util';

describe('isWorkflowRelatedObject', () => {
  it('should return true for workflow-related objects', () => {
    expect(
      isWorkflowRelatedObject({
        universalIdentifier: STANDARD_OBJECTS.workflow.universalIdentifier,
      }),
    ).toBe(true);

    expect(
      isWorkflowRelatedObject({
        universalIdentifier: STANDARD_OBJECTS.workflowRun.universalIdentifier,
      }),
    ).toBe(true);

    expect(
      isWorkflowRelatedObject({
        universalIdentifier:
          STANDARD_OBJECTS.workflowVersion.universalIdentifier,
      }),
    ).toBe(true);
  });

  it('should return false for non-workflow objects', () => {
    expect(
      isWorkflowRelatedObject({
        universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
      }),
    ).toBe(false);

    expect(
      isWorkflowRelatedObject({
        universalIdentifier: 'some-custom-object-uuid',
      }),
    ).toBe(false);
  });
});
