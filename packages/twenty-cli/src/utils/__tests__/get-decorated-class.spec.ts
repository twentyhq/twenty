import { getDecoratedClass } from '../../utils/get-decorated-class';

describe('getDecoratedClass', () => {
  it('should return properly formatted class', () => {
    const result = getDecoratedClass({
      data: { nameSingular: 'Name', namePlural: 'Names' },
      name: 'MyNewObject',
    });

    const expectedResult = `import { ObjectMetadata } from 'twenty-sdk';

@ObjectMetadata({
  nameSingular: 'Name',
  namePlural: 'Names',
})
export class MyNewObject {}
`;

    expect(result).toEqual(expectedResult);
  });
});
