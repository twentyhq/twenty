import { getApplicationContentIncludesText } from '@/settings/applications/utils/getApplicationContentIncludesText';

const buildItem = (label: string, objectUniversalIdentifier?: string) => ({
  __typename: 'ApplicationContentItem' as const,
  universalIdentifier: label,
  label,
  id: null,
  icon: null,
  color: null,
  description: null,
  objectUniversalIdentifier: objectUniversalIdentifier ?? null,
  parentLabel: null,
  parentUniversalIdentifier: null,
  fieldUniversalIdentifier: null,
  tag: null,
  count: null,
  position: null,
  timeoutSeconds: null,
});

const OBJECT_LABELS: Record<string, string> = {
  invoice: 'Invoices',
  company: 'Companies',
};

const getIncludesText = ({
  contentType,
  items,
}: {
  contentType: 'fields' | 'views';
  items: ReturnType<typeof buildItem>[];
}) =>
  getApplicationContentIncludesText({
    contentType,
    items,
    getItemLabel: (item) => item.label,
    getObjectLabel: (objectUniversalIdentifier) =>
      OBJECT_LABELS[objectUniversalIdentifier ?? ''],
    unknownObjectLabel: 'Unknown object',
    formatFieldCountOnObject: ({ count, objectLabel }) =>
      `${count} on ${objectLabel}`,
  });

describe('getApplicationContentIncludesText', () => {
  it('should list item labels', () => {
    expect(
      getIncludesText({
        contentType: 'views',
        items: [buildItem('All invoices'), buildItem('Unpaid')],
      }),
    ).toBe('All invoices, Unpaid');
  });

  it('should group fields by object', () => {
    expect(
      getIncludesText({
        contentType: 'fields',
        items: [
          buildItem('Amount', 'invoice'),
          buildItem('Due date', 'invoice'),
          buildItem('Tier', 'company'),
          buildItem('Note', 'unknown'),
        ],
      }),
    ).toBe('2 on Invoices, 1 on Companies, 1 on Unknown object');
  });
});
