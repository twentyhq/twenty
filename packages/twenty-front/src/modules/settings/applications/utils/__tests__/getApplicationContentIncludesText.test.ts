import { getApplicationContentIncludesText } from '@/settings/applications/utils/getApplicationContentIncludesText';

const buildItem = (label: string, objectUniversalIdentifier?: string) => ({
  __typename: 'ApplicationContentItem' as const,
  universalIdentifier: label,
  label,
  icon: null,
  description: null,
  objectUniversalIdentifier: objectUniversalIdentifier ?? null,
  parentLabel: null,
  tag: null,
  count: null,
});

const OBJECT_LABELS: Record<string, string> = {
  invoice: 'Invoices',
  company: 'Companies',
};

const getIncludesText = (
  contentType: 'fields' | 'views',
  items: ReturnType<typeof buildItem>[],
) =>
  getApplicationContentIncludesText({
    contentType,
    items,
    getItemLabel: (item) => item.label,
    getObjectLabel: (objectUniversalIdentifier) =>
      OBJECT_LABELS[objectUniversalIdentifier],
    formatFieldCountOnObject: (count, objectLabel) =>
      `${count} on ${objectLabel}`,
  });

describe('getApplicationContentIncludesText', () => {
  it('should list item labels', () => {
    expect(
      getIncludesText('views', [
        buildItem('All invoices'),
        buildItem('Unpaid'),
      ]),
    ).toBe('All invoices, Unpaid');
  });

  it('should group fields by object', () => {
    expect(
      getIncludesText('fields', [
        buildItem('Amount', 'invoice'),
        buildItem('Due date', 'invoice'),
        buildItem('Tier', 'company'),
      ]),
    ).toBe('2 on Invoices, 1 on Companies');
  });
});
