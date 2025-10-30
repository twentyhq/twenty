import { getObjectMetadataDecoratedClass } from '../../utils/get-object-metadata-decorated-class';

describe('getDecoratedClass', () => {
  it('should return properly formatted class', () => {
    const result = getObjectMetadataDecoratedClass({
      data: { nameSingular: 'Name', namePlural: 'Names' },
      name: 'MyNewObject',
    });

    const expectedResult = `import { ObjectMetadata } from 'twenty-sdk/application';

@ObjectMetadata({
  nameSingular: 'Name',
  namePlural: 'Names',
})
export class MyNewObject {}
`;

    expect(result).toEqual(expectedResult);
  });
});
