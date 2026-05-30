import { getObjectNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/object/utils/getObjectNavigationMenuItemComputedLink';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

describe('getObjectNavigationMenuItemComputedLink', () => {
  const objectMetadataItems = [
    {
      id: 'metadata-1',
      namePlural: 'opportunities',
    } as EnrichedObjectMetadataItem,
  ];

  it('should return record index path without a viewId query param', () => {
    const result = getObjectNavigationMenuItemComputedLink(
      { targetObjectMetadataId: 'metadata-1' },
      objectMetadataItems,
    );

    expect(result).toBe(
      getAppPath(AppPath.RecordIndexPage, {
        objectNamePlural: 'opportunities',
      }),
    );
    expect(result).not.toContain('viewId=');
  });

  it('should return empty string when target object metadata is not found', () => {
    const result = getObjectNavigationMenuItemComputedLink(
      { targetObjectMetadataId: 'missing' },
      objectMetadataItems,
    );

    expect(result).toBe('');
  });
});
