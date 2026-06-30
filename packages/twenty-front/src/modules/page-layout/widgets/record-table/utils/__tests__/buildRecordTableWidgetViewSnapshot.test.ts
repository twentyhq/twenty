import { buildRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshot';
import { ViewVisibility } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('buildRecordTableWidgetViewSnapshot', () => {
  const objectMetadataItem = getMockObjectMetadataItemOrThrow('company');

  it('should create the widget view with WORKSPACE visibility so it is shared with all workspace members', () => {
    const { view } = buildRecordTableWidgetViewSnapshot(objectMetadataItem);

    expect(view.visibility).toBe(ViewVisibility.WORKSPACE);
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
