import { expect } from '@storybook/test';

import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { computeRecordBoardColumnDefinitionsFromObjectMetadata } from '../computeRecordBoardColumnDefinitionsFromObjectMetadata';

describe('computeRecordBoardColumnDefinitionsFromObjectMetadata', () => {
  it('should correctly compute', () => {
    const objectMetadataItem = generatedMockObjectMetadataItems.find(
      (item) => item.nameSingular === 'opportunity',
    );

    const stageField = objectMetadataItem?.fields.find(
      (field) => field.name === 'stage',
    );

    if (!objectMetadataItem) {
      throw new Error('Object metadata item not found');
    }

    const res = computeRecordBoardColumnDefinitionsFromObjectMetadata(
      objectMetadataItem,
      stageField?.id,
      () => null,
    );
    expect(res.length).toEqual(stageField?.options?.length);
  });
});
