import { sortByProperty } from '~/utils/array/sortByProperty';

interface User {
  id: number;
  name: string;
  age: number;
  score: number;
}

describe('sortByProperty', () => {
  const users: User[] = [
    { id: 1, name: 'John', age: 30, score: 85.5 },
    { id: 2, name: 'Alice', age: 25, score: 92.0 },
    { id: 3, name: 'Bob', age: 35, score: 78.3 },
    { id: 4, name: 'Charlie', age: 28, score: 88.7 },
  ];

  describe('string property sorting', () => {
    it('should sort by string property ascending', () => {
      const sorted = [...users].sort(sortByProperty('name', 'asc'));

      expect(sorted.map((u) => u.name)).toEqual([
        'Alice',
        'Bob',
        'Charlie',
        'John',
      ]);
    });

    it('should sort by string property descending', () => {
      const sorted = [...users].sort(sortByProperty('name', 'desc'));

      expect(sorted.map((u) => u.name)).toEqual([
        'John',
        'Charlie',
        'Bob',
        'Alice',
      ]);
    });

    it('should default to ascending when no direction specified', () => {
      const sorted = [...users].sort(sortByProperty('name'));

      expect(sorted.map((u) => u.name)).toEqual([
        'Alice',
        'Bob',
        'Charlie',
        'John',
      ]);
    });
  });

  describe('number property sorting', () => {
    it('should sort by number property ascending', () => {
      const sorted = [...users].sort(sortByProperty('age', 'asc'));

      expect(sorted.map((u) => u.age)).toEqual([25, 28, 30, 35]);
    });

    it('should sort by number property descending', () => {
      const sorted = [...users].sort(sortByProperty('age', 'desc'));

      expect(sorted.map((u) => u.age)).toEqual([35, 30, 28, 25]);
    });

    it('should sort by decimal number property', () => {
      const sorted = [...users].sort(sortByProperty('score', 'asc'));

      expect(sorted.map((u) => u.score)).toEqual([78.3, 85.5, 88.7, 92.0]);
    });
  });

  describe('edge cases', () => {
    it('should handle empty array', () => {
      const sorted: User[] = [].sort(sortByProperty('name', 'asc'));

      expect(sorted).toEqual([]);
    });

    it('should handle single item array', () => {
      const singleUser = [{ name: 'John', age: 30 }];

      const sorted = [...singleUser].sort(sortByProperty('name', 'asc'));

      expect(sorted).toEqual(singleUser);
    });

    it('should handle identical values', () => {
      const identicalUsers = [
        { name: 'John', age: 30 },
        { name: 'John', age: 30 },
        { name: 'John', age: 30 },
      ];

      const sorted = [...identicalUsers].sort(sortByProperty('age', 'asc'));

      expect(sorted).toEqual(identicalUsers);
    });

    it('should handle mixed case strings', () => {
      const mixedCaseUsers = [
        { name: 'john' },
        { name: 'ALICE' },
        { name: 'Bob' },
        { name: 'charlie' },
      ];

      const sorted = [...mixedCaseUsers].sort(sortByProperty('name', 'asc'));

      expect(sorted.map((u) => u.name)).toEqual([
        'ALICE',
        'Bob',
        'charlie',
        'john',
      ]);
    });

    it('should handle negative numbers', () => {
      const numbersArray = [
        { value: -10 },
        { value: 5 },
        { value: -3 },
        { value: 0 },
        { value: 15 },
      ];

      const sorted = [...numbersArray].sort(sortByProperty('value', 'asc'));

      expect(sorted.map((n) => n.value)).toEqual([-10, -3, 0, 5, 15]);
    });
  });

  describe('error handling', () => {
    it('should throw error for unsupported property type', () => {
      const objectsWithUnsupportedType = [
        { data: { nested: 'value' } },
        { data: { nested: 'other' } },
      ];

      expect(() => {
        [...objectsWithUnsupportedType].sort(sortByProperty('data', 'asc'));
      }).toThrow(
        'Property type not supported in sortByProperty, only string and number are supported',
      );
    });

    it('should throw error for array property type', () => {
      const objectsWithArrays = [{ tags: ['a', 'b'] }, { tags: ['c', 'd'] }];

      expect(() => {
        [...objectsWithArrays].sort(sortByProperty('tags', 'asc'));
      }).toThrow(
        'Property type not supported in sortByProperty, only string and number are supported',
      );
    });

    it('should throw error for boolean property type', () => {
      const objectsWithBoolean = [{ active: true }, { active: false }];

      expect(() => {
        [...objectsWithBoolean].sort(sortByProperty('active', 'asc'));
      }).toThrow(
        'Property type not supported in sortByProperty, only string and number are supported',
      );
    });
  });

  describe('type safety', () => {
    it('should work with different object shapes', () => {
      const products = [
        { name: 'Laptop', price: 999.99, category: 'Electronics' },
        { name: 'Book', price: 19.99, category: 'Education' },
        { name: 'Chair', price: 149.5, category: 'Furniture' },
      ];

      const sortedByName = [...products].sort(sortByProperty('name', 'asc'));

      expect(sortedByName.map((p) => p.name)).toEqual([
        'Book',
        'Chair',
        'Laptop',
      ]);

      const sortedByPrice = [...products].sort(sortByProperty('price', 'desc'));
      expect(sortedByPrice.map((p) => p.price)).toEqual([999.99, 149.5, 19.99]);
    });
  });
});
