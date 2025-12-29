import { getObjectDecoratedClass } from '@/cli/utils/get-object-decorated-class';

describe('getObjectDecoratedClass', () => {
  it('should return proper object file', () => {
    expect(
      getObjectDecoratedClass({
        data: {
          universalIdentifier: '4122a047-260f-4cf1-bf4f-a268579d7ddf',
          nameSingular: 'name',
          namePlural: 'names',
          labelSingular: 'Name',
          labelPlural: 'Names',
        },
        name: 'MyNewObject',
      }),
    ).toBe(
      `import { Object } from 'twenty-sdk';

@Object({
  universalIdentifier: '4122a047-260f-4cf1-bf4f-a268579d7ddf',
  nameSingular: 'name',
  namePlural: 'names',
  labelSingular: 'Name',
  labelPlural: 'Names',
})
export class MyNewObject {}
`,
    );
  });
});
