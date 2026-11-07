import { getDashboardFilterBindableFieldMetadataItems } from '@/side-panel/pages/page-layout/utils/getDashboardFilterBindableFieldMetadataItems';
import {
  FieldMetadataType,
  PageLayoutFilterType,
} from '~/generated-metadata/graphql';

const buildField = (
  name: string,
  type: FieldMetadataType,
  isActive = true,
) => ({ id: `${name}-id`, name, type, isActive });

describe('getDashboardFilterBindableFieldMetadataItems', () => {
  it('should offer the active date and date-time fields of the object, except deletedAt', () => {
    const closeDate = buildField('closeDate', FieldMetadataType.DATE);
    const createdAt = buildField('createdAt', FieldMetadataType.DATE_TIME);

    expect(
      getDashboardFilterBindableFieldMetadataItems({
        fieldMetadataItems: [
          closeDate,
          createdAt,
          buildField('deletedAt', FieldMetadataType.DATE_TIME),
          buildField('signedAt', FieldMetadataType.DATE, false),
          buildField('name', FieldMetadataType.TEXT),
          buildField('amount', FieldMetadataType.CURRENCY),
        ],
        pageLayoutFilterType: PageLayoutFilterType.DATE,
      }),
    ).toEqual([closeDate, createdAt]);
  });
});
