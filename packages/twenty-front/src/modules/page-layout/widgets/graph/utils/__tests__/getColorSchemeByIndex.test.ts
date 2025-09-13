import { type GraphColorRegistry } from '../../types/GraphColorRegistry';
import { getColorSchemeByIndex } from '../getColorSchemeByIndex';
describe('getColorSchemeByIndex', () => {
  const mockRegistry: GraphColorRegistry = {
    blue: {
      name: 'blue',
      gradient: {
        normal: ['#blue1', '#blue2'],
        hover: ['#blue3', '#blue4'],
      },
      solid: '#blue',
    },
    red: {
      name: 'red',
      gradient: {
        normal: ['#red1', '#red2'],
        hover: ['#red3', '#red4'],
      },
      solid: '#red',
    },
    green: {
      name: 'green',
      gradient: {
        normal: ['#green1', '#green2'],
        hover: ['#green3', '#green4'],
      },
      solid: '#green',
    },
  };
  it('should return first color for index 0', () => {
    const result = getColorSchemeByIndex(mockRegistry, 0);
    expect(result.name).toBe('blue');
  });
  it('should return second color for index 1', () => {
    const result = getColorSchemeByIndex(mockRegistry, 1);
    expect(result.name).toBe('red');
  });
  it('should return third color for index 2', () => {
    const result = getColorSchemeByIndex(mockRegistry, 2);
    expect(result.name).toBe('green');
  });
  it('should wrap around when index exceeds registry size', () => {
    const result = getColorSchemeByIndex(mockRegistry, 3);
    expect(result.name).toBe('blue');
  });
  it('should handle large indices with modulo', () => {
    const result = getColorSchemeByIndex(mockRegistry, 10);
    expect(result.name).toBe('red');
  });
  it('should handle very large indices', () => {
    const result = getColorSchemeByIndex(mockRegistry, 100);
    expect(result.name).toBe('red');
  });
  it('should return undefined for negative indices', () => {
    const result = getColorSchemeByIndex(mockRegistry, -1);
    expect(result).toBeUndefined();
  });
  it('should work with single color registry', () => {
    const singleColorRegistry: GraphColorRegistry = {
      blue: mockRegistry.blue,
    };
    expect(getColorSchemeByIndex(singleColorRegistry, 0).name).toBe('blue');
    expect(getColorSchemeByIndex(singleColorRegistry, 1).name).toBe('blue');
    expect(getColorSchemeByIndex(singleColorRegistry, 5).name).toBe('blue');
  });
  it('should maintain consistent order', () => {
    const firstCall = getColorSchemeByIndex(mockRegistry, 0);
    const secondCall = getColorSchemeByIndex(mockRegistry, 0);
    expect(firstCall).toEqual(secondCall);
    const sequence = [0, 1, 2, 3, 4, 5].map(
      (i) => getColorSchemeByIndex(mockRegistry, i).name,
    );
    expect(sequence).toEqual(['blue', 'red', 'green', 'blue', 'red', 'green']);
  });
});
