import { isNull } from '@sniptt/guards';
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
type ClassComponentConstruction = Parameters<
  Fixture['renderClass']
>[0]['construction'];

const COMPOSITIONS: Composition[] = [
  'native',
  'plain-function',
  'forward-ref',
  'memo',
  'create-element',
  'clone-element',
  'base-ui-render',
];

const CLONE_REF_CASES = [
  { mount: 'fresh', cloneRef: 'null', refCalls: [] },
  {
    mount: 'fresh',
    cloneRef: 'a replacement',
    refCalls: ['replacement attached', 'replacement detached'],
  },
  {
    mount: 'fresh',
    cloneRef: 'undefined',
    refCalls: ['original attached', 'original detached'],
  },
  {
    mount: 'mounted',
    cloneRef: 'null',
    refCalls: ['original attached', 'original detached'],
  },
  {
    mount: 'mounted',
    cloneRef: 'a replacement',
    refCalls: [
      'original attached',
      'original detached',
      'replacement attached',
      'replacement detached',
    ],
  },
  {
    mount: 'mounted',
    cloneRef: 'undefined',
    refCalls: ['original attached', 'original detached'],
  },
] as const;

const REF_FORWARDING_ELEMENT_KINDS = [
  'function',
  'forward-ref',
  'memo',
] as const;

const CLEANUP_REF_COMPOSITIONS = COMPOSITIONS.filter(
  (composition) => composition !== 'memo',
);

const CLASS_COMPONENT_CONSTRUCTIONS: ClassComponentConstruction[] = [
  'jsx',
  'create-element',
  'clone-element',
  'forward-ref',
];

const getCloneRefConfig = <TReplacementRef>(
  cloneRef: (typeof CLONE_REF_CASES)[number]['cloneRef'],
  replacementRef: TReplacementRef,
) =>
  ({ null: null, 'a replacement': replacementRef, undefined: undefined })[
    cloneRef
  ];

describe.each([false, true])(
  'front-component DOM refs (usePreact: %s)',
  (usePreact) => {
    let source: string;
    let environment: JSDOM;
    let fixture: Fixture;
    let container: Element;

    const getButtonByText = (text: string) =>
      Array.from(container.querySelectorAll('html-button')).find(
        (button) => button.textContent === text,
      );

    const nameRefCalls = (
      ref: { mock: { calls: unknown[][] } },
      targetsByName: Record<string, unknown>,
    ) =>
      ref.mock.calls.map(([value]) =>
        isNull(value)
          ? null
          : (Object.entries(targetsByName).find(
              ([, target]) => target === value,
            )?.[0] ?? 'an unexpected value'),
      );

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

    it.each(CLASS_COMPONENT_CONSTRUCTIONS)(
      'preserves class component instances in %s refs',
      (construction) => {
        const ref = vi.fn();

        fixture.renderClass({ construction, label: 'Initial', ref });
        expect(container.textContent).toBe('Initial');
        const instance = ref.mock.lastCall?.[0];

        expect(instance.getLabel()).toBe('Initial');
        expect(instance).not.toBe(container.firstElementChild);

        fixture.renderClass({ construction, label: 'Updated', ref });
        expect(container.textContent).toBe('Updated');
        expect(ref.mock.lastCall?.[0]).toBe(instance);
        expect(instance.getLabel()).toBe('Updated');

        fixture.unmount();
        expect(ref).toHaveBeenLastCalledWith(null);
      },
    );

    it('merges the Base UI render element ref with its parent ref through updates and unmount', () => {
      const firstParentRef = vi.fn();
      const firstRenderRef = vi.fn();
      const secondParentRef = vi.fn();
      const secondRenderRef = vi.fn();

      fixture.renderComposedRefs({
        label: 'Initial',
        ref: firstParentRef,
        renderRef: firstRenderRef,
      });
      expect(container.textContent).toBe('Initial');
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
      expect(container.textContent).toBe('Updated');

      expect(container.firstElementChild).toBe(element);
      expect(firstParentRef).toHaveBeenLastCalledWith(null);
      expect(firstRenderRef).toHaveBeenLastCalledWith(null);
      expect(secondParentRef).toHaveBeenLastCalledWith(element);
      expect(secondRenderRef).toHaveBeenLastCalledWith(element);

      fixture.unmount();
      expect(secondParentRef).toHaveBeenLastCalledWith(null);
      expect(secondRenderRef).toHaveBeenLastCalledWith(null);
    });

    it.each(REF_FORWARDING_ELEMENT_KINDS)(
      'keeps a rendered %s element ref when the element is reused as a Base UI render prop',
      async (kind) => {
        const ref = vi.fn();

        fixture
          .createReusableElement({ kind, label: 'Reused', ref })
          .renderInRenderPropSwitch('Render through Base UI');
        const directlyRenderedButton = getButtonByText('Reused');

        expect(directlyRenderedButton?.nodeType).toBe(1);
        expect(nameRefCalls(ref, { directlyRenderedButton })).toEqual([
          'directlyRenderedButton',
        ]);

        await fixture.click(getButtonByText('Render through Base UI')!);
        const renderPropButton = getButtonByText('Reused');

        expect(renderPropButton?.nodeType).toBe(1);
        expect(
          nameRefCalls(ref, { directlyRenderedButton, renderPropButton }),
        ).toEqual(['directlyRenderedButton', null, 'renderPropButton']);

        fixture.unmount();
        expect(
          nameRefCalls(ref, { directlyRenderedButton, renderPropButton }),
        ).toEqual(['directlyRenderedButton', null, 'renderPropButton', null]);
      },
    );

    it.each(REF_FORWARDING_ELEMENT_KINDS)(
      'attaches the ref of a %s element rendered directly and by a following Base UI render prop sibling',
      (kind) => {
        const ref = vi.fn();

        fixture
          .createReusableElement({ kind, label: 'Reused', ref })
          .renderWithRenderPropSibling();
        const [directlyRenderedButton, renderPropButton] = Array.from(
          container.querySelectorAll('html-button'),
        );
        const buttons = { directlyRenderedButton, renderPropButton };

        expect(renderPropButton?.nodeType).toBe(1);
        expect(nameRefCalls(ref, buttons)).toEqual([
          'directlyRenderedButton',
          'renderPropButton',
        ]);

        fixture.unmount();
        expect(nameRefCalls(ref, buttons)).toEqual([
          'directlyRenderedButton',
          'renderPropButton',
          null,
          null,
        ]);
      },
    );

    it.each(REF_FORWARDING_ELEMENT_KINDS)(
      'shows a following sibling the ref of a %s element rendered before it',
      (kind) => {
        const ref = vi.fn();
        const handleElementRefRead = vi.fn();

        fixture
          .createReusableElement({ kind, label: 'Read', ref })
          .renderWithRefReaderSibling(handleElementRefRead);

        expect(handleElementRefRead.mock.calls).toEqual([[ref]]);
      },
    );

    it('shows a following sibling no ref for a class element rendered before it without one', () => {
      const handleElementRefRead = vi.fn();

      fixture
        .createReusableElement({ kind: 'class', label: 'Read' })
        .renderWithRefReaderSibling(handleElementRefRead);

      expect(handleElementRefRead).toHaveBeenCalledOnce();
      expect(handleElementRefRead.mock.calls[0]?.[0] ?? null).toBeNull();
    });

    it('attaches the ref of an element rendered again after it was unmounted', () => {
      const ref = vi.fn();
      const reusableElement = fixture.createReusableElement({
        kind: 'function',
        label: 'Remounted',
        ref,
      });

      reusableElement.render();
      const firstButton = container.firstElementChild;
      fixture.renderNothing();
      reusableElement.render();
      const secondButton = container.firstElementChild;

      expect(firstButton?.nodeType).toBe(1);
      expect(secondButton?.nodeType).toBe(1);
      expect(nameRefCalls(ref, { firstButton, secondButton })).toEqual([
        'firstButton',
        null,
        'secondButton',
      ]);

      fixture.unmount();
      expect(nameRefCalls(ref, { firstButton, secondButton })).toEqual([
        'firstButton',
        null,
        'secondButton',
        null,
      ]);
    });

    it('keeps keyed function component refs on their elements when the list is reordered', () => {
      const firstRef = vi.fn();
      const secondRef = vi.fn();
      const thirdRef = vi.fn();
      const items = [
        { label: 'First', ref: firstRef },
        { label: 'Second', ref: secondRef },
        { label: 'Third', ref: thirdRef },
      ];

      fixture.renderKeyedList(items);
      const [firstButton, secondButton, thirdButton] = Array.from(
        container.children,
      );

      fixture.renderKeyedList([items[2], items[0], items[1]]);
      const buttons = { firstButton, secondButton, thirdButton };

      expect(container.textContent).toBe('ThirdFirstSecond');
      expect(container.children[0]).toBe(thirdButton);
      expect(container.children[1]).toBe(firstButton);
      expect(container.children[2]).toBe(secondButton);
      expect(nameRefCalls(firstRef, buttons)).toEqual(['firstButton']);
      expect(nameRefCalls(secondRef, buttons)).toEqual(['secondButton']);
      expect(nameRefCalls(thirdRef, buttons)).toEqual(['thirdButton']);

      fixture.unmount();
      expect(nameRefCalls(firstRef, buttons)).toEqual(['firstButton', null]);
      expect(nameRefCalls(secondRef, buttons)).toEqual(['secondButton', null]);
      expect(nameRefCalls(thirdRef, buttons)).toEqual(['thirdButton', null]);
    });

    it('replaces a callback ref when cloning an element before its first render', () => {
      const originalRef = vi.fn();
      const replacementCleanup = vi.fn();
      const replacementRef = vi.fn(() => replacementCleanup);
      const reusableElement = fixture.createReusableElement({
        kind: 'function',
        label: 'Original',
        ref: originalRef,
      });

      reusableElement.renderClone({
        label: 'Cloned',
        ref: replacementRef,
      });
      expect(container.textContent).toBe('Cloned');

      expect(originalRef).not.toHaveBeenCalled();
      expect(
        nameRefCalls(replacementRef, { element: container.firstElementChild }),
      ).toEqual(['element']);

      fixture.unmount();
      expect(originalRef).not.toHaveBeenCalled();
      expect(replacementRef.mock.calls).toHaveLength(1);
      expect(replacementCleanup).toHaveBeenCalledOnce();
    });

    it('replaces an object ref on a fresh clone without mutating the source element', () => {
      const originalRef = { current: null as HTMLButtonElement | null };
      const replacementRef = { current: null as HTMLButtonElement | null };
      const reusableElement = fixture.createReusableElement({
        kind: 'function',
        label: 'Original',
        ref: originalRef,
      });

      reusableElement.renderClone({ label: 'Cloned', ref: replacementRef });
      expect(container.textContent).toBe('Cloned');
      const element = container.firstElementChild;

      expect(originalRef.current).toBeNull();
      expect(replacementRef.current).toBe(element);

      reusableElement.render();
      expect(container.textContent).toBe('Original');
      expect(container.firstElementChild).toBe(element);
      expect(replacementRef.current).toBeNull();
      expect(originalRef.current).toBe(element);

      fixture.unmount();
      expect(originalRef.current).toBeNull();
    });

    it('preserves, replaces and clears a mounted element ref when cloning it', () => {
      const ref = vi.fn();
      const reusableElement = fixture.createReusableElement({
        kind: 'function',
        label: 'Initial',
        ref,
      });

      reusableElement.render();
      expect(container.textContent).toBe('Initial');
      const element = container.firstElementChild;
      expect(ref.mock.lastCall?.[0]?.nodeType).toBe(1);
      expect(ref).toHaveBeenLastCalledWith(element);

      reusableElement.renderClone({ label: 'Updated' });
      expect(container.textContent).toBe('Updated');
      expect(container.firstElementChild).toBe(element);
      expect(ref).toHaveBeenLastCalledWith(element);

      const replacementRef = vi.fn();
      reusableElement.renderClone({ label: 'Replaced', ref: replacementRef });
      expect(container.textContent).toBe('Replaced');
      expect(ref).toHaveBeenLastCalledWith(null);
      expect(replacementRef).toHaveBeenLastCalledWith(element);

      reusableElement.renderClone({ label: 'Cleared', ref: null });
      expect(container.textContent).toBe('Cleared');
      expect(ref).toHaveBeenLastCalledWith(null);
      expect(replacementRef).toHaveBeenLastCalledWith(null);
      expect(container.firstElementChild).toBe(element);

      fixture.unmount();
    });

    describe('a cloned host element', () => {
      it.each(CLONE_REF_CASES)(
        'applies $cloneRef as the clone ref of a $mount element like React',
        ({ mount, cloneRef, refCalls }) => {
          const recordedRefCalls: string[] = [];
          const createRecordingRef =
            (refName: string) => (value: object | null) => {
              if (isNull(value)) {
                recordedRefCalls.push(`${refName} detached`);

                return;
              }

              recordedRefCalls.push(
                value === container.firstElementChild
                  ? `${refName} attached`
                  : `${refName} attached to an unexpected value`,
              );
            };
          const reusableElement = fixture.createReusableElement({
            kind: 'host',
            label: 'Original',
            ref: createRecordingRef('original'),
          });

          if (mount === 'mounted') {
            reusableElement.render();
          }

          reusableElement.renderClone({
            label: 'Cloned',
            ref: getCloneRefConfig(cloneRef, createRecordingRef('replacement')),
          });
          expect(container.textContent).toBe('Cloned');

          fixture.unmount();
          expect(recordedRefCalls).toEqual(refCalls);
        },
      );
    });

    it.each(CLONE_REF_CASES)(
      'keeps the JSX click handler of a $mount host element cloned with $cloneRef as its ref',
      ({ mount, cloneRef }) => {
        const handleClick = vi.fn();
        const originalRef = vi.fn();
        const replacementRef = vi.fn();
        const reusableElement = fixture.createReusableElement({
          kind: 'host',
          label: 'Original',
          ref: originalRef,
          onClick: handleClick,
        });

        if (mount === 'mounted') {
          reusableElement.render();
        }

        reusableElement.renderClone({
          label: 'Cloned',
          ref: getCloneRefConfig(cloneRef, replacementRef),
        });
        getButtonByText('Cloned')?.dispatchEvent(
          new environment.window.MouseEvent('click', { bubbles: true }),
        );

        expect(handleClick).toHaveBeenCalledOnce();
      },
    );

    it('keeps a clone ref attached while the cloning component re-renders around an element with handlers', async () => {
      const cleanup = vi.fn();
      const cloneRef = vi.fn(() => cleanup);
      const handleClick = vi.fn();

      fixture.renderCloneRefSlot({
        label: 'Cloned',
        cloneRef,
        onClick: handleClick,
      });
      const clonedButton = getButtonByText('Cloned');

      await fixture.click(getButtonByText('Re-render 0')!);
      await fixture.click(getButtonByText('Re-render 1')!);
      expect(getButtonByText('Re-render 2')).toBeDefined();
      expect(nameRefCalls(cloneRef, { clonedButton })).toEqual([
        'clonedButton',
      ]);
      expect(cleanup).not.toHaveBeenCalled();

      clonedButton?.dispatchEvent(
        new environment.window.MouseEvent('click', { bubbles: true }),
      );
      expect(handleClick).toHaveBeenCalledOnce();

      fixture.unmount();
      expect(cleanup).toHaveBeenCalledOnce();
    });

    it.each(COMPOSITIONS)(
      'keeps %s callback refs on the DOM element through updates and unmount',
      (composition) => {
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
        expect(container.textContent).toBe('Initial');
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
        expect(container.textContent).toBe('Updated');

        expect(container.firstElementChild).toBe(element);
        expect(firstRef).toHaveBeenLastCalledWith(null);
        expect(secondRef).toHaveBeenLastCalledWith(element);
        element.dispatchEvent(
          new environment.window.Event('click', { bubbles: true }),
        );
        expect(firstClick).toHaveBeenCalledOnce();
        expect(secondClick).toHaveBeenCalledOnce();

        fixture.render({ composition, label: 'Cleared', ref: null });
        expect(container.textContent).toBe('Cleared');
        expect(container.firstElementChild).toBe(element);
        expect(secondRef).toHaveBeenLastCalledWith(null);

        fixture.render({ composition, label: 'Restored', ref: secondRef });
        expect(container.textContent).toBe('Restored');
        expect(secondRef).toHaveBeenLastCalledWith(element);

        fixture.unmount();
        expect(secondRef).toHaveBeenLastCalledWith(null);
        expect(container.childElementCount).toBe(0);
      },
    );

    it.each(COMPOSITIONS)(
      'clears replaced and unmounted %s object refs',
      (composition) => {
        const firstRef = { current: null as HTMLButtonElement | null };
        const secondRef = { current: null as HTMLButtonElement | null };

        fixture.render({ composition, label: 'Initial', ref: firstRef });
        expect(container.textContent).toBe('Initial');
        const element = container.firstElementChild;

        expect(firstRef.current?.nodeType).toBe(1);
        expect(firstRef.current).toBe(element);
        fixture.render({ composition, label: 'Updated', ref: secondRef });
        expect(container.textContent).toBe('Updated');

        expect(firstRef.current).toBeNull();
        expect(secondRef.current).toBe(element);

        fixture.render({ composition, label: 'Cleared' });
        expect(container.textContent).toBe('Cleared');
        expect(container.firstElementChild).toBe(element);
        expect(secondRef.current).toBeNull();

        fixture.render({ composition, label: 'Restored', ref: secondRef });
        expect(container.textContent).toBe('Restored');
        expect(secondRef.current).toBe(element);
        fixture.unmount();
        expect(secondRef.current).toBeNull();
      },
    );

    it.each(CLEANUP_REF_COMPOSITIONS)(
      'runs %s callback ref cleanups instead of calling the refs with null',
      (composition) => {
        const firstCleanup = vi.fn();
        const secondCleanup = vi.fn();
        const firstRef = vi.fn(() => firstCleanup);
        const secondRef = vi.fn(() => secondCleanup);

        fixture.render({ composition, label: 'Initial', ref: firstRef });
        const element = container.firstElementChild;

        expect(element?.nodeType).toBe(1);
        expect(nameRefCalls(firstRef, { element })).toEqual(['element']);
        expect(firstCleanup).not.toHaveBeenCalled();

        fixture.render({ composition, label: 'Updated', ref: secondRef });
        expect(container.firstElementChild).toBe(element);
        expect(nameRefCalls(firstRef, { element })).toEqual(['element']);
        expect(firstCleanup).toHaveBeenCalledOnce();
        expect(nameRefCalls(secondRef, { element })).toEqual(['element']);
        expect(secondCleanup).not.toHaveBeenCalled();

        fixture.unmount();
        expect(nameRefCalls(secondRef, { element })).toEqual(['element']);
        expect(secondCleanup).toHaveBeenCalledOnce();
      },
    );
  },
);
