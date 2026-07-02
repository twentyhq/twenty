import { filterProps } from '../filterProps';

const filter = (props: Record<string, unknown>, htmlTag: string) =>
  filterProps(props, htmlTag) as Record<string, unknown>;

describe('filterProps', () => {
  it('should drop internal remote-dom props', () => {
    const result = filter(
      { element: {}, receiver: {}, components: {}, id: 'keep' },
      'div',
    );

    expect(result).toEqual({ id: 'keep' });
  });

  it('should drop undefined values', () => {
    const result = filter({ title: undefined, id: 'x' }, 'div');

    expect('title' in result).toBe(false);
    expect(result.id).toBe('x');
  });

  it('should parse the style string into an object', () => {
    const result = filter({ style: 'color: red' }, 'div');

    expect(result.style).toEqual({ color: 'red' });
  });

  it('should wrap function event handlers and normalize their key', () => {
    const onClick = jest.fn();
    const result = filter({ onClick }, 'div');

    expect(typeof result.onClick).toBe('function');
    expect(result.onClick).not.toBe(onClick);
  });

  it('should drop event-handler props whose value is not a function', () => {
    const result = filter({ onClick: 'alert(1)', onmouseover: 'x' }, 'div');

    expect('onClick' in result).toBe(false);
    expect('onMouseOver' in result).toBe(false);
    expect('onmouseover' in result).toBe(false);
  });

  it('should drop a dangerous scheme on a navigation attribute', () => {
    const result = filter({ href: 'javascript:alert(1)' }, 'a');

    expect('href' in result).toBe(false);
  });

  it('should keep a dangerous scheme on a non-navigation attribute', () => {
    const dataImage = 'data:image/png;base64,iVBOR';
    const result = filter({ src: dataImage }, 'img');

    expect(result.src).toBe(dataImage);
  });

  it('should keep a safe url on a navigation attribute', () => {
    const result = filter({ href: 'https://twenty.com' }, 'a');

    expect(result.href).toBe('https://twenty.com');
  });
});
