import { transformRelationConnectWhereValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/transformer-utils/transform-relation-connect-where.util';

describe('transformRelationConnectWhereValue', () => {
  it('should return an empty object when value is an empty object', () => {
    const result = transformRelationConnectWhereValue({});

    expect(result).toEqual({});
  });

  it('should lowercase primaryEmail', () => {
    const result = transformRelationConnectWhereValue({
      emails: { primaryEmail: 'Person@MyTest.COM' },
    });

    expect(result).toEqual({
      emails: { primaryEmail: 'person@mytest.com' },
    });
  });

  it('should lowercase primaryLinkUrl origin', () => {
    const result = transformRelationConnectWhereValue({
      domainName: { primaryLinkUrl: 'https://Example.COM/path' },
    });

    expect(result).toEqual({
      domainName: { primaryLinkUrl: 'https://example.com/path' },
    });
  });

  it('should not modify composite values without primaryEmail or primaryLinkUrl', () => {
    const result = transformRelationConnectWhereValue({
      name: { firstName: 'John', lastName: 'Doe' },
    });

    expect(result).toEqual({
      name: { firstName: 'John', lastName: 'Doe' },
    });
  });

  it('should not modify empty primaryEmail', () => {
    const result = transformRelationConnectWhereValue({
      emails: { primaryEmail: '' },
    });

    expect(result).toEqual({
      emails: { primaryEmail: '' },
    });
  });
});
