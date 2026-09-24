import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
import { renderHook } from '@testing-library/react';
import { CoreObjectNameSingular, FieldMetadataType } from 'twenty-shared/types';

jest.mock('@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem');
jest.mock('@/object-metadata/hooks/useObjectMetadataItem');
jest.mock('@/object-metadata/hooks/useObjectMetadataItems');
jest.mock('@/object-record/hooks/useObjectPermissions');

const activityBodyField = {
  id: 'activity-body-field-id',
  name: 'bodyV2',
  type: FieldMetadataType.RICH_TEXT,
  isActive: true,
} as FieldMetadataItem;

describe('useFieldListFieldMetadataItems', () => {
  beforeEach(() => {
    jest.mocked(useLabelIdentifierFieldMetadataItem).mockReturnValue({
      labelIdentifierFieldMetadataItem: undefined,
    });
    jest.mocked(useObjectMetadataItem).mockReturnValue({
      objectMetadataItem: {
        readableFields: [activityBodyField],
      } as ReturnType<typeof useObjectMetadataItem>['objectMetadataItem'],
    });
    jest.mocked(useObjectMetadataItems).mockReturnValue({
      objectMetadataItems: [],
    });
    jest.mocked(useObjectPermissions).mockReturnValue({
      objectPermissionsByObjectMetadataId: {},
    });
  });

  it.each([CoreObjectNameSingular.Note, CoreObjectNameSingular.Task])(
    'includes the %s body in field lists',
    (objectNameSingular) => {
      const { result } = renderHook(() =>
        useFieldListFieldMetadataItems({ objectNameSingular }),
      );

      expect(result.current.inlineFieldMetadataItems).toEqual([
        activityBodyField,
      ]);
    },
  );
});
