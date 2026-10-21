import { transformSync } from 'esbuild';

import { unwrapDefineFrontComponentToDirectExport } from '@/cli/utilities/build/common/front-component-build/utils/unwrap-define-front-component-to-direct-export';

const INLINE_EXPRESSION_COMPONENT_SOURCE = `import { defineFrontComponent } from 'twenty-sdk/define';

import { SUMMARIZE_COMPANY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { createSummarizeRecordEffect } from 'src/front-components/utils/create-summarize-record-effect';
import { SUMMARIZE_TARGETS } from 'src/front-components/utils/summarize-target';

const SummarizeRecordEffect = createSummarizeRecordEffect(SUMMARIZE_TARGETS.company)

export default defineFrontComponent({
  universalIdentifier: SUMMARIZE_COMPANY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Summarize Company',
  description: 'Asks AI to summarize the selected company',
  isHeadless: true,
  component: createSummarizeRecordEffect(SUMMARIZE_TARGETS.company),
});
`;

const IDENTIFIER_COMPONENT_SOURCE = `import { defineFrontComponent } from 'twenty-sdk/define';

import { SUMMARIZE_COMPANY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { createSummarizeRecordEffect } from 'src/front-components/utils/create-summarize-record-effect';
import { SUMMARIZE_TARGETS } from 'src/front-components/utils/summarize-target';

const SummarizeRecordEffect = createSummarizeRecordEffect(SUMMARIZE_TARGETS.company)

export default defineFrontComponent({
  universalIdentifier: SUMMARIZE_COMPANY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Summarize Company',
  description: 'Asks AI to summarize the selected company',
  isHeadless: true,
  component: SummarizeRecordEffect,
});
`;

const SETTINGS_COMPONENT_SOURCE = `import { defineSettingsFrontComponent } from 'twenty-sdk/define';

import { APP_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { AppSettings } from 'src/front-components/components/AppSettings';

export default defineSettingsFrontComponent({
  universalIdentifier: APP_SETTINGS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'app-settings',
  description: 'Custom settings tab',
  component: AppSettings,
});
`;

type RenderedElement = {
  component: (props: object) => unknown;
  props: object;
};

const loadRenderer = (
  render: (element: RenderedElement) => void,
  useEffect: (effect: () => void) => void = () => {},
) => {
  const source = unwrapDefineFrontComponentToDirectExport(`
    import { defineFrontComponent } from 'twenty-sdk/define';
    export default defineFrontComponent({ component: () => null });
  `);
  const { code } = transformSync(source, { format: 'cjs' });
  const bundleModule = { exports: {} };
  const requireModule = (specifier: string) => {
    if (specifier === 'react') {
      return { useEffect };
    }
    if (specifier === 'react-dom/client') {
      return { createRoot: () => ({ render }) };
    }
    if (specifier === 'react/jsx-runtime') {
      return {
        jsx: (component: unknown, props: unknown) => ({ component, props }),
      };
    }
    throw new Error(`Unexpected import: ${specifier}`);
  };

  new Function('module', 'exports', 'require', code)(
    bundleModule,
    bundleModule.exports,
    requireModule,
  );

  return bundleModule.exports as {
    default: (container: object, props?: object) => Promise<void>;
  };
};

describe('unwrapDefineFrontComponentToDirectExport', () => {
  it('renders the component when component is an inline factory call', () => {
    const output = unwrapDefineFrontComponentToDirectExport(
      INLINE_EXPRESSION_COMPONENT_SOURCE,
    );

    expect(output).toContain(
      'component: createSummarizeRecordEffect(SUMMARIZE_TARGETS.company),',
    );
    expect(output).toContain(
      '__frontComponentJsx(__frontComponentDefinition.component, __props)',
    );
    expect(output).not.toContain('defineFrontComponent');
  });

  it('renders the component when component is a bare identifier', () => {
    const output = unwrapDefineFrontComponentToDirectExport(
      IDENTIFIER_COMPONENT_SOURCE,
    );

    expect(output).toContain('component: SummarizeRecordEffect,');
    expect(output).toContain(
      '__frontComponentJsx(__frontComponentDefinition.component, __props)',
    );
    expect(output).not.toContain('defineFrontComponent');
  });

  it('produces an equivalent renderer for the inline and identifier forms', () => {
    const inlineOutput = unwrapDefineFrontComponentToDirectExport(
      INLINE_EXPRESSION_COMPONENT_SOURCE,
    );
    const identifierOutput = unwrapDefineFrontComponentToDirectExport(
      IDENTIFIER_COMPONENT_SOURCE,
    );

    const renderer =
      'export default function __renderFrontComponent(__container, __props = {})';

    expect(inlineOutput).toContain(renderer);
    expect(identifierOutput).toContain(renderer);
  });

  it('renders the component when defined with defineSettingsFrontComponent', () => {
    const output = unwrapDefineFrontComponentToDirectExport(
      SETTINGS_COMPONENT_SOURCE,
    );

    expect(output).toContain('component: AppSettings,');
    expect(output).toContain(
      '__frontComponentJsx(__frontComponentDefinition.component, __props)',
    );
    expect(output).not.toContain('defineSettingsFrontComponent');
  });

  it('leaves a source without a defineFrontComponent default export untouched', () => {
    const source = `import { useEffect } from 'react';

export const createSummarizeRecordEffect = () => () => null;
`;

    expect(unwrapDefineFrontComponentToDirectExport(source)).toBe(source);
  });

  it('passes data props and waits for the initial commit', async () => {
    const renderedElements: unknown[] = [];
    const effects: (() => void)[] = [];
    const props = { records: [{ id: 'sample', name: 'Example' }] };
    const renderer = loadRenderer(
      (element) => renderedElements.push(element.component(element.props)),
      (effect) => effects.push(effect),
    );
    let ready = false;
    const result = renderer.default({}, props).then(() => {
      ready = true;
    });

    await Promise.resolve();
    expect(ready).toBe(false);
    expect(renderedElements).toEqual([
      { component: expect.any(Function), props },
    ]);
    effects.forEach((effect) => effect());
    await result;
    expect(ready).toBe(true);
  });

  it('rejects the initial render when mounting fails', async () => {
    const error = new Error('Cannot mount component');
    const renderer = loadRenderer(() => {
      throw error;
    });

    await expect(renderer.default({})).rejects.toThrow(error);
  });
});
