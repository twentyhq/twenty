import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { resolveViewNamePlaceholders } from '@/views/utils/resolveViewNamePlaceholders';

const objectMetadataItem = {
  labelSingular: 'Company',
  labelPlural: 'Companies',
} as FlatObjectMetadataItem;

describe('resolveViewNamePlaceholders', () => {
  it('translates the engine-provisioned INDEX view name', () => {
    // The engine stores this name as a literal for every object, so without translating it
    // the "All" prefix reaches every non-English workspace in English.
    expect(
      resolveViewNamePlaceholders('All {objectLabelPlural}', objectMetadataItem),
    ).toBe('All Companies');
  });

  it('resolves the plural placeholder in a custom view name', () => {
    expect(
      resolveViewNamePlaceholders('Active {objectLabelPlural}', objectMetadataItem),
    ).toBe('Active Companies');
  });

  it('resolves the singular placeholder', () => {
    expect(
      resolveViewNamePlaceholders('{objectLabelSingular} pipeline', objectMetadataItem),
    ).toBe('Company pipeline');
  });

  it('leaves a name without placeholders untouched', () => {
    expect(resolveViewNamePlaceholders('My view', objectMetadataItem)).toBe(
      'My view',
    );
  });

  it('returns an empty string when the name is undefined', () => {
    expect(resolveViewNamePlaceholders(undefined, objectMetadataItem)).toBe('');
  });

  it('returns the raw name when the object metadata is missing', () => {
    // Nothing to interpolate with: showing the template beats showing nothing.
    expect(
      resolveViewNamePlaceholders('All {objectLabelPlural}', undefined),
    ).toBe('All {objectLabelPlural}');
  });
});
