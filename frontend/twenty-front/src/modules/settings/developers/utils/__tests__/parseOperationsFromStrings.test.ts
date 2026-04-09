import { parseOperationsFromStrings } from '@/settings/developers/utils/parseOperationsFromStrings';

describe('parseOperationsFromStrings', () => {
  it('should parse operation strings into object/action pairs', () => {
    const operations = ['person.created', 'company.updated', 'lead.deleted'];

    const result = parseOperationsFromStrings(operations);

    expect(result).toEqual([
      { object: 'person', action: 'created' },
      { object: 'company', action: 'updated' },
      { object: 'lead', action: 'deleted' },
    ]);
  });

  it('should handle wildcard operations across objects and metadata', () => {
    const operations = ['*.*', 'metadata.*.*'];

    const result = parseOperationsFromStrings(operations);

    expect(result).toEqual([
      { object: '*', action: '*' },
      { object: 'metadata.*', action: '*' },
    ]);
  });

  it('should handle mixed object and metadata entity operations', () => {
    const operations = ['person.created', 'metadata.objectMetadata.created'];

    const result = parseOperationsFromStrings(operations);

    expect(result).toEqual([
      { object: 'person', action: 'created' },
      { object: 'metadata.objectMetadata', action: 'created' },
    ]);
  });

  it('should handle wildcard and specific operations together', () => {
    const operations = ['*.*', 'metadata.objectMetadata.updated'];

    const result = parseOperationsFromStrings(operations);

    expect(result).toEqual([
      { object: '*', action: '*' },
      { object: 'metadata.objectMetadata', action: 'updated' },
    ]);
  });

  it('should handle empty array', () => {
    const operations: string[] = [];

    const result = parseOperationsFromStrings(operations);

    expect(result).toEqual([]);
  });

  it('should handle operations with multiple dots by taking first two parts', () => {
    const operations = ['person.created.test'];

    const result = parseOperationsFromStrings(operations);

    expect(result).toEqual([{ object: 'person', action: 'created' }]);
  });
});
