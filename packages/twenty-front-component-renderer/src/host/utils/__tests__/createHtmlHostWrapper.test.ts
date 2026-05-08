import { createHtmlHostWrapper } from '../createHtmlHostWrapper';

describe('createHtmlHostWrapper', () => {
  describe('cursor-sensitive elements', () => {
    it('should return a component for input', () => {
      const wrapper = createHtmlHostWrapper('input');

      expect(typeof wrapper).toBe('function');
    });

    it('should return a component for textarea', () => {
      const wrapper = createHtmlHostWrapper('textarea');

      expect(typeof wrapper).toBe('function');
    });
  });

  describe('non-cursor-sensitive elements', () => {
    it('should return a component for div', () => {
      const wrapper = createHtmlHostWrapper('div');

      expect(typeof wrapper).toBe('function');
    });

    it('should return a component for span', () => {
      const wrapper = createHtmlHostWrapper('span');

      expect(typeof wrapper).toBe('function');
    });
  });
});
