import { buildRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshot';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('buildRecordTableWidgetViewSnapshot', () => {
  const objectMetadataItem = getMockObjectMetadataItemOrThrow('company');

  it('should create a non-private widget view so it is shared with all workspace members', () => {
    const { view } = buildRecordTableWidgetViewSnapshot(objectMetadataItem);

    expect(view.isPrivate).toBe(false);
  });

  it('should keep the label identifier view field visible and in the lowest position', () => {
    const { viewFields } =
      buildRecordTableWidgetViewSnapshot(objectMetadataItem);

    const labelIdentifierViewField = viewFields.find(
      (viewField) =>
        viewField.fieldMetadataId ===
        objectMetadataItem.labelIdentifierFieldMetadataId,
    );

    expect(labelIdentifierViewField).toMatchObject({
      isVisible: true,
      position: 0,
    });
    expect(
      viewFields.every(
        (viewField) =>
          viewField.fieldMetadataId ===
            objectMetadataItem.labelIdentifierFieldMetadataId ||
          viewField.position > 0,
      ),
    ).toBe(true);
  });
});
