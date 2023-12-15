import { mapFavorites } from '../mapFavorites';

describe('mapFavorites', () => {
  it('should return the correct value', () => {
    const favorites = [
      {
        id: '1',
        person: {
          id: '2',
          name: {
            firstName: 'John',
            lastName: 'Doe',
          },
          avatarUrl: 'https://example.com/avatar.png',
        },
      },
      {
        id: '3',
        company: {
          id: '4',
          name: 'My Company',
          domainName: 'example.com',
        },
        position: 1,
      },
    ];

    const res = mapFavorites(favorites);

    expect(res).toHaveLength(2);

    // Person
    expect(res[0].id).toBe('1');
    expect(res[0].labelIdentifier).toBe('John Doe');
    expect(res[0].avatarUrl).toBe('https://example.com/avatar.png');
    expect(res[0].avatarType).toBe('rounded');
    expect(res[0].link).toBe('/object/person/2');
    expect(res[0].recordId).toBe('2');
    expect(res[0].position).toBeUndefined();

    // Company
    expect(res[1].id).toBe('3');
    expect(res[1].labelIdentifier).toBe('My Company');
    expect(res[1].avatarUrl).toBe('https://favicon.twenty.com/example.com');
    expect(res[1].avatarType).toBe('squared');
    expect(res[1].link).toBe('/object/company/4');
    expect(res[1].recordId).toBe('4');
    expect(res[1].position).toBe(1);
  });
});
