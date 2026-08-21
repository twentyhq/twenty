import { resolveViewNamePlaceholders } from '@/views/utils/resolveViewNamePlaceholders';
import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';

const objectMetadataItem = {
  labelSingular: 'widget',
  labelPlural: 'widgets',
} as FlatObjectMetadataItem;

describe('resolveViewNamePlaceholders', () => {
  it('fills the object label placeholders', () => {
    expect(
      resolveViewNamePlaceholders(
        'All {objectLabelPlural}',
        objectMetadataItem,
      ),
    ).toBe('All Widgets');
    expect(
      resolveViewNamePlaceholders(
        '{objectLabelSingular} Record Page',
        objectMetadataItem,
      ),
    ).toBe('Widget Record Page');
  });

  it('leaves a name without placeholders untouched', () => {
    expect(
      resolveViewNamePlaceholders('My custom view', objectMetadataItem),
    ).toBe('My custom view');
  });

  it('returns the name unchanged when the object is unknown', () => {
    expect(
      resolveViewNamePlaceholders('All {objectLabelPlural}', undefined),
    ).toBe('All {objectLabelPlural}');
  });
});
