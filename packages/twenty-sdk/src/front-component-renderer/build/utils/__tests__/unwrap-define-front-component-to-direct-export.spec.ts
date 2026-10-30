import { transformSync } from 'esbuild';
import { vi } from 'vitest';

import { unwrapDefineFrontComponentToDirectExport } from '@/front-component-renderer/build/utils/unwrap-define-front-component-to-direct-export';

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

const loadRenderer = ({
  render,
  useEffect = () => {},
}: {
  render: (element: RenderedElement) => void;
  useEffect?: (effect: () => void) => void;
}) => {
  const source = unwrapDefineFrontComponentToDirectExport(`
    import { defineFrontComponent } from 'twenty-sdk/define';
    export default defineFrontComponent({ component: () => null });
  `);
  const { code } = transformSync(source, { format: 'cjs' });
  const bundleModule: {
    exports: {
      default?: (container: object, props?: object) => Promise<void>;
    };
  } = { exports: {} };
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

  if (typeof bundleModule.exports.default !== 'function') {
    throw new Error('The compiled component did not export a renderer.');
  }

  return { default: bundleModule.exports.default };
};

describe('unwrapDefineFrontComponentToDirectExport', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

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
    vi.useFakeTimers();
    const renderedElements: unknown[] = [];
    const effects: (() => void)[] = [];
    const props = { records: [{ id: 'sample', name: 'Example' }] };
    const renderer = loadRenderer({
      render: (element) =>
        renderedElements.push(element.component(element.props)),
      useEffect: (effect) => effects.push(effect),
    });
    const onReady = vi.fn();
    const result = renderer.default({}, props).then(onReady);

    await Promise.resolve();
    expect(onReady).not.toHaveBeenCalled();
    expect(renderedElements).toEqual([
      { component: expect.any(Function), props },
    ]);
    effects.forEach((effect) => effect());
    await result;
    expect(onReady).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('rejects the initial render when mounting fails', async () => {
    vi.useFakeTimers();
    const error = new Error('Cannot mount component');
    const renderer = loadRenderer({
      render: () => {
        throw error;
      },
    });

    await expect(renderer.default({})).rejects.toThrow(error);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('rejects when the first render never commits', async () => {
    vi.useFakeTimers();
    const renderer = loadRenderer({ render: () => {} });
    const result = renderer.default({});
    const rejection = expect(result).rejects.toThrow(
      'Front component initial render timed out.',
    );

    await vi.advanceTimersByTimeAsync(30_000);

    await rejection;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('keeps imports used by a non-default definition', () => {
    const source =
      "import { defineFrontComponent } from 'twenty-sdk/define';\nexport const definition = defineFrontComponent({ component: () => null });";
    expect(unwrapDefineFrontComponentToDirectExport(source)).toBe(source);
  });

  it('unwraps a multiline import with a trailing comma', () => {
    const source = IDENTIFIER_COMPONENT_SOURCE.replace(
      'import { defineFrontComponent }',
      'import {\n  defineFrontComponent,\n}',
    );
    const output = unwrapDefineFrontComponentToDirectExport(source);

    expect(output).not.toContain('defineFrontComponent');
    expect(output).toContain('__frontComponentDefinition.component');
  });

  it('handles long whitespace after the definition import without backtracking', () => {
    const source = IDENTIFIER_COMPONENT_SOURCE.replace(
      "import { defineFrontComponent } from 'twenty-sdk/define';",
      `import { defineFrontComponent${' '.repeat(50_000)}! } from 'twenty-sdk/define';`,
    );

    const startedAt = performance.now();
    const output = unwrapDefineFrontComponentToDirectExport(source);

    expect(output).toContain('__frontComponentDefinition.component');
    expect(performance.now() - startedAt).toBeLessThan(1000);
  });
});
