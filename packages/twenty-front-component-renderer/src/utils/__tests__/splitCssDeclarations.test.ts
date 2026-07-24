import { splitCssDeclarations } from '../splitCssDeclarations';

describe('splitCssDeclarations', () => {
  it('should split plain declarations on semicolons', () => {
    expect(splitCssDeclarations('color: red; font-size: 14px')).toEqual([
      'color: red',
      ' font-size: 14px',
    ]);
  });

  it('should keep semicolons inside quoted strings', () => {
    expect(splitCssDeclarations('content: "a;b"; color: red')).toEqual([
      'content: "a;b"',
      ' color: red',
    ]);
  });

  it('should keep semicolons inside single quoted strings', () => {
    expect(splitCssDeclarations("content: 'a;b'")).toEqual(["content: 'a;b'"]);
  });

  it('should keep semicolons after an escaped quote inside a string', () => {
    expect(splitCssDeclarations('content: "a\\";b"; color: red')).toEqual([
      'content: "a\\";b"',
      ' color: red',
    ]);
  });

  it('should drop comments and not split on their inner semicolons', () => {
    const declarations = splitCssDeclarations(
      'color: red; /* a; b */ background: blue',
    );

    expect(declarations).toHaveLength(2);
    expect(declarations[0]).toBe('color: red');
    expect(declarations[1].trim()).toBe('background: blue');
  });

  it('should collapse a comment between tokens into a separator', () => {
    expect(splitCssDeclarations('margin: 1px/**/2px')[0].trim()).toBe(
      'margin: 1px 2px',
    );
  });

  it('should keep semicolons inside url parentheses', () => {
    expect(
      splitCssDeclarations(
        'background: url(data:image/png;base64,abc); color: red',
      ),
    ).toEqual(['background: url(data:image/png;base64,abc)', ' color: red']);
  });

  it('should handle nested parentheses', () => {
    expect(
      splitCssDeclarations('width: calc(min(10px; 2px)); color: red'),
    ).toEqual(['width: calc(min(10px; 2px))', ' color: red']);
  });

  it('should return the whole text when there is no top level semicolon', () => {
    expect(splitCssDeclarations('color: red')).toEqual(['color: red']);
  });
});
