import { type ApplicationContentFilter } from '@/settings/applications/utils/getApplicationContentFilters';
import { getApplicationContentListFilterState } from '@/settings/applications/utils/getApplicationContentListFilterState';

const buildOption = (universalIdentifier: string) => ({
  universalIdentifier,
  label: universalIdentifier,
  icon: 'IconBox',
});

const OBJECT_FILTER: ApplicationContentFilter = {
  key: 'object',
  isSelectable: true,
  options: [buildOption('invoice'), buildOption('company')],
  getItemKeys: (item) => [item.objectUniversalIdentifier],
};

const buildItem = (objectUniversalIdentifier: string) => ({
  __typename: 'ApplicationContentItem' as const,
  universalIdentifier: `${objectUniversalIdentifier}-field`,
  label: 'Field',
  id: null,
  icon: null,
  color: null,
  description: null,
  objectUniversalIdentifier,
  parentLabel: null,
  parentUniversalIdentifier: null,
  fieldUniversalIdentifier: null,
  tag: null,
  count: null,
  position: null,
  timeoutSeconds: null,
});

describe('getApplicationContentListFilterState', () => {
  it('should keep only items matching the filter set in the URL', () => {
    const { activeFilters, selectedSelectableValue, matchesActiveFilters } =
      getApplicationContentListFilterState({
        filters: [OBJECT_FILTER],
        searchParams: new URLSearchParams({ object: 'invoice' }),
      });

    expect(activeFilters.map(({ key }) => key)).toEqual(['object']);
    expect(selectedSelectableValue).toBe('invoice');
    expect(matchesActiveFilters(buildItem('invoice'))).toBe(true);
    expect(matchesActiveFilters(buildItem('company'))).toBe(false);
  });

  it('should ignore URL values that match no option', () => {
    const { activeFilters, matchesActiveFilters } =
      getApplicationContentListFilterState({
        filters: [OBJECT_FILTER],
        searchParams: new URLSearchParams({ object: 'unknown' }),
      });

    expect(activeFilters).toEqual([]);
    expect(matchesActiveFilters(buildItem('company'))).toBe(true);
  });
});
