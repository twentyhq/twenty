import { extractColorFromProps } from '@/page-layout/widgets/standalone-rich-text/utils/extractColorFromProps';

describe('extractColorFromProps', () => {
  describe('text color extraction', () => {
    it('should return textColor when present and is a string', () => {
      const props = { textColor: 'red' };
      expect(extractColorFromProps(props, 'text')).toBe('red');
    });

    it('should return default when textColor is not a string', () => {
      const props = { textColor: 123 };
      expect(extractColorFromProps(props, 'text')).toBe('default');
    });

    it('should return default when textColor is missing', () => {
      const props = {};
      expect(extractColorFromProps(props, 'text')).toBe('default');
    });

    it('should return default when textColor is null', () => {
      const props = { textColor: null };
      expect(extractColorFromProps(props, 'text')).toBe('default');
    });

    it('should return default when textColor is undefined', () => {
      const props = { textColor: undefined };
      expect(extractColorFromProps(props, 'text')).toBe('default');
    });
  });

  describe('background color extraction', () => {
    it('should return backgroundColor when present and is a string', () => {
      const props = { backgroundColor: 'blue' };
      expect(extractColorFromProps(props, 'background')).toBe('blue');
    });

    it('should return default when backgroundColor is not a string', () => {
      const props = { backgroundColor: { value: 'blue' } };
      expect(extractColorFromProps(props, 'background')).toBe('default');
    });

    it('should return default when backgroundColor is missing', () => {
      const props = {};
      expect(extractColorFromProps(props, 'background')).toBe('default');
    });

    it('should return default when backgroundColor is null', () => {
      const props = { backgroundColor: null };
      expect(extractColorFromProps(props, 'background')).toBe('default');
    });
  });

  describe('edge cases', () => {
    it('should not confuse textColor and backgroundColor', () => {
      const props = { textColor: 'red', backgroundColor: 'blue' };
      expect(extractColorFromProps(props, 'text')).toBe('red');
      expect(extractColorFromProps(props, 'background')).toBe('blue');
    });

    it('should handle empty string as valid color', () => {
      const props = { textColor: '' };
      expect(extractColorFromProps(props, 'text')).toBe('');
    });
  });
});
