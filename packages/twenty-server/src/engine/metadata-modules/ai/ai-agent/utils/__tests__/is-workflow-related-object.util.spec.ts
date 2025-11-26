import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';

import { isWorkflowRelatedObject } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-workflow-related-object.util';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

describe('isWorkflowRelatedObject', () => {
  it('should return true for workflow-related objects', () => {
    expect(
      isWorkflowRelatedObject({
        standardId: STANDARD_OBJECT_IDS.workflow,
      } as ObjectMetadataEntity),
    ).toBe(true);

    expect(
      isWorkflowRelatedObject({
        standardId: STANDARD_OBJECT_IDS.workflowRun,
      } as ObjectMetadataEntity),
    ).toBe(true);

    expect(
      isWorkflowRelatedObject({
        standardId: STANDARD_OBJECT_IDS.workflowVersion,
      } as ObjectMetadataEntity),
    ).toBe(true);
  });

  it('should return false for non-workflow objects', () => {
    expect(
      isWorkflowRelatedObject({
        standardId: STANDARD_OBJECT_IDS.person,
      } as ObjectMetadataEntity),
    ).toBe(false);

    expect(
      isWorkflowRelatedObject({
        standardId: null,
      } as ObjectMetadataEntity),
    ).toBe(false);
  });
});
