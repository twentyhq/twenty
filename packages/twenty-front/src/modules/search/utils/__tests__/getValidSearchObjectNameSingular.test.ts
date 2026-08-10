import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getValidSearchObjectNameSingular } from '@/search/utils/getValidSearchObjectNameSingular';

const filterableObjectMetadataItems = [
  { nameSingular: 'company' },
  { nameSingular: 'person' },
] as EnrichedObjectMetadataItem[];

describe('getValidSearchObjectNameSingular', () => {
  it('should keep an object the filter list offers', () => {
    expect(
      getValidSearchObjectNameSingular({
        objectNameSingular: 'company',
        filterableObjectMetadataItems,
      }),
    ).toBe('company');
  });

  it('should drop an object that does not exist', () => {
    expect(
      getValidSearchObjectNameSingular({
        objectNameSingular: 'notAnObject',
        filterableObjectMetadataItems,
      }),
    ).toBeNull();
  });

  it('should drop an object the filter list does not offer', () => {
    expect(
      getValidSearchObjectNameSingular({
        objectNameSingular: 'messageThread',
        filterableObjectMetadataItems,
      }),
    ).toBeNull();
  });

  it('should drop every object while the metadata is still empty', () => {
    expect(
      getValidSearchObjectNameSingular({
        objectNameSingular: 'company',
        filterableObjectMetadataItems: [],
      }),
    ).toBeNull();
  });

  it('should pass through no filter at all', () => {
    expect(
      getValidSearchObjectNameSingular({
        objectNameSingular: null,
        filterableObjectMetadataItems,
      }),
    ).toBeNull();
  });
});
