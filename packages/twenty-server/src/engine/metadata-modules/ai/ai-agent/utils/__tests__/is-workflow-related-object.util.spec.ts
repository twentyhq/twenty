import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import {
  LEGACY_WORKSPACE_WORKFLOW_AUTOMATED_TRIGGER_OBJECT_UNIVERSAL_IDENTIFIER,
  LEGACY_WORKSPACE_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER,
} from 'src/modules/workflow/common/constants/legacy-workspace-workflow-object-universal-identifiers.constant';
import { isWorkflowRelatedObject } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-workflow-related-object.util';

describe('isWorkflowRelatedObject', () => {
  it('should return true for workflow-related objects', () => {
    expect(
      isWorkflowRelatedObject({
        universalIdentifier:
          LEGACY_WORKSPACE_WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER,
      }),
    ).toBe(true);

    expect(
      isWorkflowRelatedObject({
        universalIdentifier:
          LEGACY_WORKSPACE_WORKFLOW_AUTOMATED_TRIGGER_OBJECT_UNIVERSAL_IDENTIFIER,
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
