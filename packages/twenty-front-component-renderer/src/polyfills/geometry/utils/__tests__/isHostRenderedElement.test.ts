import { isHostRenderedElement } from '../isHostRenderedElement';

describe('isHostRenderedElement', () => {
  it('should accept allowed elements rendered by the host', () => {
    expect(isHostRenderedElement({ localName: 'html-div' })).toBe(true);
    expect(isHostRenderedElement({ localName: 'html-svg' })).toBe(true);
  });

  it.each([
    'html-clippath',
    'html-lineargradient',
    'html-radialgradient',
    'html-foreignobject',
  ])('should accept the camel-cased SVG element %s', (localName) => {
    expect(isHostRenderedElement({ localName })).toBe(true);
  });

  it('should reject elements the host does not render', () => {
    expect(isHostRenderedElement({ localName: 'remote-fragment' })).toBe(false);
    expect(isHostRenderedElement({})).toBe(false);
  });
});
