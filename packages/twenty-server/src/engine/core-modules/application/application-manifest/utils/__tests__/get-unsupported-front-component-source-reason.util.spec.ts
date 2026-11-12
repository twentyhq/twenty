import { getUnsupportedFrontComponentSourceReason } from 'src/engine/core-modules/application/application-manifest/utils/get-unsupported-front-component-source-reason.util';

const identifier = '11111111-1111-4111-8111-111111111111';
const definition = `export default defineFrontComponent({ universalIdentifier: '${identifier}', component: Component });`;
const check = (source: string) =>
  getUnsupportedFrontComponentSourceReason({
    source,
    universalIdentifier: identifier,
    name: 'Component',
    description: null,
    componentName: 'Component',
  });

describe('front component source export', () => {
  it('accepts original TSX and package subpath imports without executing it', () => {
    expect(
      check(`import { defineFrontComponent } from 'twenty-sdk/define';
import { Button } from 'twenty-ui/input';
const Component = () => <Button>Hello</Button>;
${definition}`),
    ).toBeUndefined();
  });
  it.each([
    `import { label } from './helper';`,
    `import 'twenty-ui/../../helper';`,
    `/// <reference types="./types" />`,
    `import type { Props } from '../types';`,
    `import './style.css';`,
    `export { label } from '@/helper';`,
    `const load = () => import('./helper');`,
    `const load = () => import(moduleName);`,
    `const helper = require('./helper');`,
    `/// <reference path="../types.d.ts" />`,
  ])('leaves import resolution to the app build: %s', (importSource) => {
    expect(check(`${importSource}\n${definition}`)).toBeUndefined();
  });
  it.each(['const broken = ;', 'const Component = () => <div><span></div>;'])(
    'leaves source syntax validation to the app build: %s',
    (invalidSource) => {
      expect(check(`${invalidSource}\n${definition}`)).toBeUndefined();
    },
  );
  it('rejects computed metadata keys', () => {
    expect(
      check(
        definition.replace(
          'component: Component',
          `[universalIdentifier]: '${identifier}', component: Component`,
        ),
      ),
    ).toBe('source contains computed or spread front component metadata');
  });
  it.each(['name', 'description'])(
    'rejects %s that cannot be verified statically',
    (key) => {
      expect(
        check(
          definition.replace(
            'component: Component',
            `${key}: runtimeValue, component: Component`,
          ),
        ),
      ).toContain('cannot be statically verified');
    },
  );
  it('rejects mismatched or duplicate identifiers and non-authorable source', () => {
    expect(
      check(definition.replace(identifier, 'another-identifier')),
    ).toBeDefined();
    expect(check('export default () => <div/>;')).toBeDefined();
    expect(check('export default defineFrontComponent(config);')).toBeDefined();
    expect(
      check(
        definition.replace(
          'component: Component',
          '...other, component: Component',
        ),
      ),
    ).toBeDefined();
    expect(
      check(
        definition.replace(
          'component: Component',
          `universalIdentifier: '${identifier}', component: Component`,
        ),
      ),
    ).toBeDefined();
  });
});
