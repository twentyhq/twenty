import { WEBHOOK_EMPTY_OPERATION } from '~/pages/settings/developers/webhooks/constants/WebhookEmptyOperation';
import { type WebhookOperationType } from '~/pages/settings/developers/webhooks/types/WebhookOperationsType';
import { addEmptyOperationIfNecessary } from '@/settings/developers/utils/addEmptyOperationIfNecessary';

describe('addEmptyOperationIfNecessary', () => {
  it('should add empty operation when no wildcard or null object operations exist', () => {
    const operations: WebhookOperationType[] = [
      { object: 'person', action: 'created' },
      { object: 'company', action: 'updated' },
    ];

    const result = addEmptyOperationIfNecessary(operations);

    expect(result).toEqual([
      { object: 'person', action: 'created' },
      { object: 'company', action: 'updated' },
      WEBHOOK_EMPTY_OPERATION,
    ]);
  });

  it('should add empty operation when only record wildcard operation exists', () => {
    const operations: WebhookOperationType[] = [
      { object: '*', action: '*' },
      { object: 'person', action: 'created' },
    ];

    const result = addEmptyOperationIfNecessary(operations);

    expect(result).toEqual([
      { object: '*', action: '*' },
      { object: 'person', action: 'created' },
      WEBHOOK_EMPTY_OPERATION,
    ]);
  });

  it('should add empty operation when only metadata wildcard operation exists', () => {
    const operations: WebhookOperationType[] = [
      { object: 'metadata.*', action: '*' },
      { object: 'person', action: 'created' },
    ];

    const result = addEmptyOperationIfNecessary(operations);

    expect(result).toEqual([
      { object: 'metadata.*', action: '*' },
      { object: 'person', action: 'created' },
      WEBHOOK_EMPTY_OPERATION,
    ]);
  });

  it('should not add empty operation when both record and metadata wildcard operations exist', () => {
    const operations: WebhookOperationType[] = [
      { object: '*', action: '*' },
      { object: 'metadata.*', action: '*' },
    ];

    const result = addEmptyOperationIfNecessary(operations);

    expect(result).toEqual([
      { object: '*', action: '*' },
      { object: 'metadata.*', action: '*' },
    ]);
  });

  it('should not add empty operation when null object operation exists', () => {
    const operations: WebhookOperationType[] = [
      { object: 'person', action: 'created' },
      { object: null, action: 'test' },
    ];

    const result = addEmptyOperationIfNecessary(operations);

    expect(result).toEqual([
      { object: 'person', action: 'created' },
      { object: null, action: 'test' },
    ]);
  });

  it('should handle empty array by adding empty operation', () => {
    const operations: WebhookOperationType[] = [];

    const result = addEmptyOperationIfNecessary(operations);

    expect(result).toEqual([WEBHOOK_EMPTY_OPERATION]);
  });

  it('should not modify original array', () => {
    const operations: WebhookOperationType[] = [
      { object: 'person', action: 'created' },
    ];
    const originalLength = operations.length;

    addEmptyOperationIfNecessary(operations);

    expect(operations.length).toBe(originalLength);
  });
});
