import {
  compactRecord,
  wrapInMetadataEnvelope,
} from 'src/engine/core-modules/tool-provider/utils/compact-metadata-output.util';

describe('compactRecord', () => {
  it('should strip keys with null values when listed in stripWhenNullish', () => {
    const record = {
      id: '123',
      name: 'test',
      description: null,
      icon: null,
      label: 'Test',
    };

    const result = compactRecord(record, {
      stripWhenNullish: ['description', 'icon'],
    });

    expect(result).toEqual({
      id: '123',
      name: 'test',
      label: 'Test',
    });
  });

  it('should strip keys with undefined values when listed in stripWhenNullish', () => {
    const record = {
      id: '123',
      options: undefined,
      settings: undefined,
      label: 'Test',
    };

    const result = compactRecord(record, {
      stripWhenNullish: ['options', 'settings'],
    });

    expect(result).toEqual({
      id: '123',
      label: 'Test',
    });
  });

  it('should not strip keys with truthy values', () => {
    const record = {
      id: '123',
      description: 'A description',
      options: [{ label: 'A', value: 'A' }],
    };

    const result = compactRecord(record, {
      stripWhenNullish: ['description', 'options'],
    });

    expect(result).toEqual({
      id: '123',
      description: 'A description',
      options: [{ label: 'A', value: 'A' }],
    });
  });

  it('should strip keys with false values when listed in stripWhenFalse', () => {
    const record = {
      id: '123',
      isLabelSyncedWithName: false,
      isUIReadOnly: false,
      isActive: true,
    };

    const result = compactRecord(record, {
      stripWhenFalse: ['isLabelSyncedWithName', 'isUIReadOnly'],
    });

    expect(result).toEqual({
      id: '123',
      isActive: true,
    });
  });

  it('should not strip keys with true values when listed in stripWhenFalse', () => {
    const record = {
      id: '123',
      isLabelSyncedWithName: true,
      isUIReadOnly: true,
    };

    const result = compactRecord(record, {
      stripWhenFalse: ['isLabelSyncedWithName', 'isUIReadOnly'],
    });

    expect(result).toEqual({
      id: '123',
      isLabelSyncedWithName: true,
      isUIReadOnly: true,
    });
  });

  it('should apply both stripWhenNullish and stripWhenFalse together', () => {
    const record = {
      id: '123',
      name: 'test',
      description: null,
      icon: 'IconStar',
      isLabelSyncedWithName: false,
      isUIReadOnly: true,
      options: null,
    };

    const result = compactRecord(record, {
      stripWhenNullish: ['description', 'options'],
      stripWhenFalse: ['isLabelSyncedWithName', 'isUIReadOnly'],
    });

    expect(result).toEqual({
      id: '123',
      name: 'test',
      icon: 'IconStar',
      isUIReadOnly: true,
    });
  });

  it('should return a copy without modifying the original', () => {
    const record = { id: '123', description: null };

    const result = compactRecord(record, {
      stripWhenNullish: ['description'],
    });

    expect(record).toEqual({ id: '123', description: null });
    expect(result).toEqual({ id: '123' });
  });

  it('should handle empty config gracefully', () => {
    const record = { id: '123', name: 'test' };

    const result = compactRecord(record, {});

    expect(result).toEqual({ id: '123', name: 'test' });
  });
});

describe('wrapInMetadataEnvelope', () => {
  it('should hoist workspaceId and applicationId into envelope', () => {
    const records = [
      { id: '1', name: 'field1', workspaceId: 'ws-1', applicationId: 'app-1' },
      { id: '2', name: 'field2', workspaceId: 'ws-1', applicationId: 'app-1' },
    ];

    const result = wrapInMetadataEnvelope(records, 'fields');

    expect(result).toEqual({
      workspaceId: 'ws-1',
      applicationId: 'app-1',
      fields: [
        { id: '1', name: 'field1' },
        { id: '2', name: 'field2' },
      ],
    });
  });

  it('should handle empty records array', () => {
    const result = wrapInMetadataEnvelope([], 'fields');

    expect(result).toEqual({
      fields: [],
    });
  });

  it('should handle records without hoisted keys', () => {
    const records = [
      { id: '1', name: 'obj1' },
      { id: '2', name: 'obj2' },
    ];

    const result = wrapInMetadataEnvelope(records, 'objects');

    expect(result).toEqual({
      objects: [
        { id: '1', name: 'obj1' },
        { id: '2', name: 'obj2' },
      ],
    });
  });

  it('should support custom hoistKeys', () => {
    const records = [
      { id: '1', tenantId: 'tenant-1', name: 'test' },
      { id: '2', tenantId: 'tenant-1', name: 'test2' },
    ];

    const result = wrapInMetadataEnvelope(records, 'items', ['tenantId']);

    expect(result).toEqual({
      tenantId: 'tenant-1',
      items: [
        { id: '1', name: 'test' },
        { id: '2', name: 'test2' },
      ],
    });
  });

  it('should not mutate original records', () => {
    const records = [
      { id: '1', workspaceId: 'ws-1', applicationId: 'app-1' },
    ];
    const original = { ...records[0] };

    wrapInMetadataEnvelope(records, 'fields');

    expect(records[0]).toEqual(original);
  });
});
