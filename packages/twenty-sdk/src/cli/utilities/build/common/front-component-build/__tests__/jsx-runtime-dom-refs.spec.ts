import * as esbuild from 'esbuild';
import { JSDOM } from 'jsdom';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { type createDomRefFixture } from '@/cli/utilities/build/common/front-component-build/__tests__/fixtures/dom-ref-components';
import { getBaseFrontComponentBuildOptions } from '@/cli/utilities/build/common/front-component-build/utils/get-base-front-component-build-options';
import { getFrontComponentBuildPlugins } from '@/cli/utilities/build/common/front-component-build/utils/get-front-component-build-plugins';

type Fixture = ReturnType<typeof createDomRefFixture>;
type Composition = Parameters<Fixture['render']>[0]['composition'];

const COMPOSITIONS: Composition[] = [
  'native',
  'plain-function',
  'forward-ref',
  'memo',
  'create-element',
  'clone-element',
  'base-ui-render',
];

describe.each([false, true])(
  'front-component DOM refs (usePreact: %s)',
  (usePreact) => {
    let source: string;
    let environment: JSDOM;
    let fixture: Fixture;
    let container: Element;

    beforeAll(async () => {
      const outputDirectory = await mkdtemp(join(tmpdir(), 'dom-ref-fixture-'));

      try {
        await esbuild.build({
          ...getBaseFrontComponentBuildOptions(),
          entryPoints: [
            fileURLToPath(
              new URL('./fixtures/dom-ref-components.tsx', import.meta.url),
            ),
          ],
          plugins: getFrontComponentBuildPlugins({ usePreact }),
          format: 'iife',
          globalName: 'domRefFixture',
          outdir: outputDirectory,
          sourcemap: false,
        });

        source = await readFile(
          join(outputDirectory, 'dom-ref-components.mjs'),
          'utf8',
        );
      } finally {
        await rm(outputDirectory, { recursive: true, force: true });
      }
    });

    beforeEach(() => {
      environment = new JSDOM('<div id="root"></div>', {
        runScripts: 'outside-only',
        url: 'https://fixture.example',
      });
      Object.assign(environment.window, {
        __HTML_TAG_TO_CUSTOM_ELEMENT_TAG__: { button: 'html-button' },
      });
      const fixtureModule = environment.window.eval(
        `${source};domRefFixture`,
      ) as {
        createDomRefFixture: typeof createDomRefFixture;
      };
      container = environment.window.document.getElementById('root')!;
      fixture = fixtureModule.createDomRefFixture(container);
    });

    afterEach(() => {
      fixture.unmount();
      environment.window.close();
    });

    it.each(['jsx', 'create-element', 'clone-element'] as const)(
      'preserves class component instances in %s refs',
      async (construction) => {
        const ref = vi.fn();

        fixture.renderClass({ construction, label: 'Initial', ref });
        await vi.waitFor(() => expect(container.textContent).toBe('Initial'));
        const instance = ref.mock.lastCall?.[0];

        expect(instance.getLabel()).toBe('Initial');
        expect(instance).not.toBe(container.firstElementChild);

        fixture.renderClass({ construction, label: 'Updated', ref });
        await vi.waitFor(() => expect(container.textContent).toBe('Updated'));
        expect(ref.mock.lastCall?.[0]).toBe(instance);
        expect(instance.getLabel()).toBe('Updated');

        fixture.unmount();
        expect(ref).toHaveBeenLastCalledWith(null);
      },
    );

    it('merges the Base UI render element ref with its parent ref through updates and unmount', async () => {
      const firstParentRef = vi.fn();
      const firstRenderRef = vi.fn();
      const secondParentRef = vi.fn();
      const secondRenderRef = vi.fn();

      fixture.renderComposedRefs({
        label: 'Initial',
        ref: firstParentRef,
        renderRef: firstRenderRef,
      });
      await vi.waitFor(() => expect(container.textContent).toBe('Initial'));
      const element = container.firstElementChild;

      expect(firstParentRef.mock.lastCall?.[0]?.nodeType).toBe(1);
      expect(firstRenderRef.mock.lastCall?.[0]?.nodeType).toBe(1);
      expect(firstParentRef).toHaveBeenLastCalledWith(element);
      expect(firstRenderRef).toHaveBeenLastCalledWith(element);

      fixture.renderComposedRefs({
        label: 'Updated',
        ref: secondParentRef,
        renderRef: secondRenderRef,
      });
      await vi.waitFor(() => expect(container.textContent).toBe('Updated'));

      expect(container.firstElementChild).toBe(element);
      expect(firstParentRef).toHaveBeenLastCalledWith(null);
      expect(firstRenderRef).toHaveBeenLastCalledWith(null);
      expect(secondParentRef).toHaveBeenLastCalledWith(element);
      expect(secondRenderRef).toHaveBeenLastCalledWith(element);

      fixture.unmount();
      expect(secondParentRef).toHaveBeenLastCalledWith(null);
      expect(secondRenderRef).toHaveBeenLastCalledWith(null);
    });

    it('preserves, replaces and clears a mounted element ref when cloning it', async () => {
      const ref = vi.fn();
      const reusableElement = fixture.createReusableElement({
        label: 'Initial',
        ref,
      });

      reusableElement.render();
      await vi.waitFor(() => expect(container.textContent).toBe('Initial'));
      const element = container.firstElementChild;
      expect(ref.mock.lastCall?.[0]?.nodeType).toBe(1);
      expect(ref).toHaveBeenLastCalledWith(element);

      reusableElement.renderClone({ label: 'Updated' });
      await vi.waitFor(() => expect(container.textContent).toBe('Updated'));
      expect(container.firstElementChild).toBe(element);
      expect(ref).toHaveBeenLastCalledWith(element);

      const replacementRef = vi.fn();
      reusableElement.renderClone({ label: 'Replaced', ref: replacementRef });
      await vi.waitFor(() => expect(container.textContent).toBe('Replaced'));
      expect(ref).toHaveBeenLastCalledWith(null);
      expect(replacementRef).toHaveBeenLastCalledWith(element);

      reusableElement.renderClone({ label: 'Cleared', ref: null });
      await vi.waitFor(() => expect(container.textContent).toBe('Cleared'));
      expect(ref).toHaveBeenLastCalledWith(null);
      expect(replacementRef).toHaveBeenLastCalledWith(null);
      expect(container.firstElementChild).toBe(element);

      fixture.unmount();
    });

    it.each(COMPOSITIONS)(
      'keeps %s callback refs on the DOM element through updates and unmount',
      async (composition) => {
        const firstRef = vi.fn();
        const secondRef = vi.fn();
        const firstClick = vi.fn();
        const secondClick = vi.fn();

        fixture.render({
          composition,
          label: 'Initial',
          ref: firstRef,
          onClick: firstClick,
        });
        await vi.waitFor(() => expect(container.textContent).toBe('Initial'));
        const element = container.firstElementChild!;

        expect(firstRef.mock.lastCall?.[0]?.nodeType).toBe(1);
        expect(firstRef.mock.calls.length).toBe(1);
        expect(firstRef).toHaveBeenLastCalledWith(element);
        element.dispatchEvent(
          new environment.window.Event('click', { bubbles: true }),
        );
        expect(firstClick).toHaveBeenCalledOnce();

        fixture.render({
          composition,
          label: 'Updated',
          ref: secondRef,
          onClick: secondClick,
        });
        await vi.waitFor(() => expect(container.textContent).toBe('Updated'));

        expect(container.firstElementChild).toBe(element);
        expect(firstRef).toHaveBeenLastCalledWith(null);
        expect(secondRef).toHaveBeenLastCalledWith(element);
        element.dispatchEvent(
          new environment.window.Event('click', { bubbles: true }),
        );
        expect(firstClick).toHaveBeenCalledOnce();
        expect(secondClick).toHaveBeenCalledOnce();

        fixture.render({ composition, label: 'Cleared', ref: null });
        await vi.waitFor(() => expect(container.textContent).toBe('Cleared'));
        expect(container.firstElementChild).toBe(element);
        expect(secondRef).toHaveBeenLastCalledWith(null);

        fixture.render({ composition, label: 'Restored', ref: secondRef });
        await vi.waitFor(() => expect(container.textContent).toBe('Restored'));
        expect(secondRef).toHaveBeenLastCalledWith(element);

        fixture.unmount();
        expect(secondRef).toHaveBeenLastCalledWith(null);
        expect(container.childElementCount).toBe(0);
      },
    );

    it.each(COMPOSITIONS)(
      'clears replaced and unmounted %s object refs',
      async (composition) => {
        const firstRef = { current: null as HTMLButtonElement | null };
        const secondRef = { current: null as HTMLButtonElement | null };

        fixture.render({ composition, label: 'Initial', ref: firstRef });
        await vi.waitFor(() => expect(container.textContent).toBe('Initial'));
        const element = container.firstElementChild;

        expect(firstRef.current?.nodeType).toBe(1);
        expect(firstRef.current).toBe(element);
        fixture.render({ composition, label: 'Updated', ref: secondRef });
        await vi.waitFor(() => expect(container.textContent).toBe('Updated'));

        expect(firstRef.current).toBeNull();
        expect(secondRef.current).toBe(element);

        fixture.render({ composition, label: 'Cleared' });
        await vi.waitFor(() => expect(container.textContent).toBe('Cleared'));
        expect(container.firstElementChild).toBe(element);
        expect(secondRef.current).toBeNull();

        fixture.render({ composition, label: 'Restored', ref: secondRef });
        await vi.waitFor(() => expect(container.textContent).toBe('Restored'));
        expect(secondRef.current).toBe(element);
        fixture.unmount();
        expect(secondRef.current).toBeNull();
      },
    );

    it.each(COMPOSITIONS)(
      'runs %s callback ref cleanup when replaced and unmounted',
      async (composition) => {
        const firstCleanup = vi.fn();
        const secondCleanup = vi.fn();
        const firstRef = vi.fn(() => firstCleanup);
        const secondRef = vi.fn(() => secondCleanup);

        fixture.render({ composition, label: 'Initial', ref: firstRef });
        await vi.waitFor(() => expect(container.textContent).toBe('Initial'));
        expect(firstCleanup).not.toHaveBeenCalled();

        fixture.render({ composition, label: 'Updated', ref: secondRef });
        await vi.waitFor(() => expect(container.textContent).toBe('Updated'));
        expect(firstCleanup).toHaveBeenCalledOnce();
        expect(secondCleanup).not.toHaveBeenCalled();

        fixture.unmount();
        expect(secondCleanup).toHaveBeenCalledOnce();
      },
    );
  },
);
