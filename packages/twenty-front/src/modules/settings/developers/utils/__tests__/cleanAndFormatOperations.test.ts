import { type WebhookOperationType } from '~/pages/settings/developers/webhooks/types/WebhookOperationsType';
import { cleanAndFormatOperations } from '@/settings/developers/utils/cleanAndFormatOperations';

describe('cleanAndFormatOperations', () => {
  it('should filter out operations with null object values', () => {
    const operations: WebhookOperationType[] = [
      { object: 'person', action: 'created' },
      { object: null, action: 'test' },
      { object: 'person', action: 'updated' },
    ];

    const result = cleanAndFormatOperations(operations);

    expect(result).toEqual(['person.created', 'person.updated']);
  });

  it('should remove duplicate operations', () => {
    const operations: WebhookOperationType[] = [
      { object: 'person', action: 'created' },
      { object: 'person', action: 'created' },
      { object: 'company', action: 'updated' },
    ];

    const result = cleanAndFormatOperations(operations);

    expect(result).toEqual(['person.created', 'company.updated']);
  });

  it('should handle empty array', () => {
    const operations: WebhookOperationType[] = [];

    const result = cleanAndFormatOperations(operations);

    expect(result).toEqual([]);
  });

  it('should handle wildcard operations', () => {
    const operations: WebhookOperationType[] = [
      { object: '*', action: '*' },
      { object: 'person', action: 'created' },
    ];

    const result = cleanAndFormatOperations(operations);

    expect(result).toEqual(['*.*', 'person.created']);
  });
});
