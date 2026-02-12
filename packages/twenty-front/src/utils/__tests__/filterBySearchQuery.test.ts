import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

describe('filterBySearchQuery', () => {
  type TestUser = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };

  const users: TestUser[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    },
    {
      id: '3',
      firstName: 'José',
      lastName: 'García',
      email: 'jose@example.com',
    },
    {
      id: '4',
      firstName: 'François',
      lastName: 'Müller',
      email: 'francois@example.com',
    },
  ];

  it('should return all items when search query is empty', () => {
    const result = filterBySearchQuery({
      items: users,
      searchQuery: '',
      getSearchableValues: (user) => [user.firstName, user.lastName],
    });

    expect(result).toEqual(users);
  });

  it('should return empty array when search query is only whitespace', () => {
    const result = filterBySearchQuery({
      items: users,
      searchQuery: '   ',
      getSearchableValues: (user) => [user.firstName, user.lastName],
    });

    expect(result).toEqual([]);
  });

  it('should handle partial matches', () => {
    const result = filterBySearchQuery({
      items: users,
      searchQuery: 'jan',
      getSearchableValues: (user) => [user.firstName],
    });

    expect(result).toEqual([users[1]]);
  });

  it('should normalize accents when searching', () => {
    const result = filterBySearchQuery({
      items: users,
      searchQuery: 'jose',
      getSearchableValues: (user) => [user.firstName],
    });

    expect(result).toEqual([users[2]]);
  });

  it('should normalize special characters when searching', () => {
    const result = filterBySearchQuery({
      items: users,
      searchQuery: 'muller',
      getSearchableValues: (user) => [user.lastName],
    });

    expect(result).toEqual([users[3]]);
  });

  it('should handle search with accents matching normalized text', () => {
    const result = filterBySearchQuery({
      items: users,
      searchQuery: 'José',
      getSearchableValues: (user) => [user.firstName],
    });

    expect(result).toEqual([users[2]]);
  });

  it('should return empty array when no matches found', () => {
    const result = filterBySearchQuery({
      items: users,
      searchQuery: 'nonexistent',
      getSearchableValues: (user) => [user.firstName, user.lastName],
    });

    expect(result).toEqual([]);
  });

  it('should handle empty items array', () => {
    const result = filterBySearchQuery({
      items: [],
      searchQuery: 'test',
      getSearchableValues: (user: TestUser) => [user.firstName],
    });

    expect(result).toEqual([]);
  });

  it('should be case-insensitive for both query and values', () => {
    const result = filterBySearchQuery({
      items: users,
      searchQuery: 'JOHN',
      getSearchableValues: (user) => [user.firstName.toUpperCase()],
    });

    expect(result).toEqual([users[0]]);
  });
});
