import { readFileSync } from 'fs';
import { resolve } from 'path';

import { themeCssVariables as newThemeCssVariables } from '../themeCssVariables';
// Relative import of the source-of-truth in twenty-ui (not the built dist).
import { themeCssVariables as oldThemeCssVariables } from '../../../../twenty-ui/src/theme-constants/themeCssVariables';

const NEW_DIR = resolve(__dirname, '..');
const OLD_DIR = resolve(__dirname, '../../../../twenty-ui/src/theme-constants');

const readCss = (dir: string, file: string) =>
  readFileSync(resolve(dir, file), 'utf8');

describe('theme parity with twenty-ui', () => {
  it('theme-light.css is byte-identical to twenty-ui', () => {
    expect(readCss(NEW_DIR, 'theme-light.css')).toEqual(
      readCss(OLD_DIR, 'theme-light.css'),
    );
  });

  it('theme-dark.css is byte-identical to twenty-ui', () => {
    expect(readCss(NEW_DIR, 'theme-dark.css')).toEqual(
      readCss(OLD_DIR, 'theme-dark.css'),
    );
  });

  it('themeCssVariables is deeply equal to twenty-ui', () => {
    expect(newThemeCssVariables).toEqual(oldThemeCssVariables);
  });
});
