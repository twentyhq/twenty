import { stripAnsiEscapes } from './strip-ansi-escapes.util';

describe('stripAnsiEscapes', () => {
  it('returns plain ASCII strings unchanged', () => {
    expect(stripAnsiEscapes('hello world')).toBe('hello world');
  });

  it('strips SGR color codes from a yellow value', () => {
    // What `console.log(chalk.yellow('4 '))` emits.
    expect(stripAnsiEscapes('\u001B[33m4 \u001B[39m')).toBe('4 ');
  });

  it('strips compound SGR codes (bold + red, then reset)', () => {
    expect(stripAnsiEscapes('\u001B[1;31merror\u001B[0m')).toBe('error');
  });

  it('strips 256-color and truecolor SGR sequences', () => {
    expect(stripAnsiEscapes('\u001B[38;5;208mwarn\u001B[39m')).toBe('warn');
    expect(stripAnsiEscapes('\u001B[38;2;0;128;255mblue\u001B[0m')).toBe(
      'blue',
    );
  });

  it('strips cursor-movement CSI sequences', () => {
    expect(stripAnsiEscapes('a\u001B[2Jb\u001B[Hc')).toBe('abc');
  });

  it('strips OSC sequences (e.g. terminal hyperlinks)', () => {
    const link =
      '\u001B]8;;https://twenty.com\u0007Twenty\u001B]8;;\u0007 rocks';

    expect(stripAnsiEscapes(link)).toBe('Twenty rocks');
  });

  it('handles mixed colored output across multiple chunks', () => {
    const raw =
      '\u001B[32mOK\u001B[39m \u001B[2mready\u001B[22m: \u001B[1mdone\u001B[0m';

    expect(stripAnsiEscapes(raw)).toBe('OK ready: done');
  });

  it('leaves untouched the bracket text that survived a missing ESC', () => {
    // Defensive: if the ESC byte was already stripped upstream, we should not
    // try to "fix" the bracketed remnants (we cannot tell them apart from real
    // user text).
    expect(stripAnsiEscapes('[33m4 [39m')).toBe('[33m4 [39m');
  });
});
