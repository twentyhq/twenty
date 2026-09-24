import { Window } from '@remote-dom/polyfill';

import { installSelectorMethodsPolyfill } from '../installSelectorMethodsPolyfill';

type SelectorFixture = {
  document: Document;
  setActiveElement: (element: object | null) => void;
};

const createSelectorFixture = (): SelectorFixture => {
  const polyfillWindow = new Window();
  let activeElement: object | null = null;

  installSelectorMethodsPolyfill({
    elementPrototype: polyfillWindow.Element.prototype,
    querySelectorTargets: [
      polyfillWindow.Element.prototype,
      polyfillWindow.DocumentFragment.prototype,
      polyfillWindow.document,
    ],
    resolveActiveElement: () => activeElement,
  });

  return {
    document: polyfillWindow.document as unknown as Document,
    setActiveElement: (element) => {
      activeElement = element;
    },
  };
};

const createTree = (document: Document) => {
  const list = document.createElement('div');
  list.setAttribute('role', 'tablist');
  const firstTab = document.createElement('button');
  firstTab.setAttribute('role', 'tab');
  firstTab.setAttribute('class', 'tab active');
  firstTab.setAttribute('id', 'overview');
  const secondTab = document.createElement('button');
  secondTab.setAttribute('role', 'tab');
  secondTab.setAttribute('class', 'tab');
  secondTab.setAttribute('disabled', '');
  const label = document.createElement('span');
  label.setAttribute('data-tooltip-trigger', 'true');
  secondTab.append(label);
  list.append(firstTab, secondTab);
  document.body.append(list);

  return { list, firstTab, secondTab, label };
};

describe('installSelectorMethodsPolyfill', () => {
  describe('matches', () => {
    it('should match type, id, class and attribute selectors', () => {
      const { document } = createSelectorFixture();
      const { firstTab } = createTree(document);

      expect(firstTab.matches('button')).toBe(true);
      expect(firstTab.matches('#overview')).toBe(true);
      expect(firstTab.matches('.active')).toBe(true);
      expect(firstTab.matches('.tab.active')).toBe(true);
      expect(firstTab.matches('[role="tab"]')).toBe(true);
      expect(firstTab.matches('[class~=active]')).toBe(true);
      expect(firstTab.matches('[id^=over][id$=view][id*=erv]')).toBe(true);
      expect(firstTab.matches('[role="TAB" i]')).toBe(true);
      expect(firstTab.matches('[role="TAB"]')).toBe(false);
      expect(firstTab.matches('span')).toBe(false);
      expect(firstTab.matches('.inactive')).toBe(false);
    });

    it('should match a type selector against the sandbox custom element tag', () => {
      const { document } = createSelectorFixture();
      const button = document.createElement('html-button') as Element;
      const textarea = document.createElement('html-textarea') as Element;

      expect(button.matches('button')).toBe(true);
      expect(button.matches('html-button')).toBe(true);
      expect(button.matches('button,a[href],[role="button"]')).toBe(true);
      expect(textarea.matches('input,textarea,[contenteditable]')).toBe(true);
      expect(button.matches('textarea')).toBe(false);
    });

    it('should match combinators against ancestors and siblings', () => {
      const { document } = createSelectorFixture();
      const { firstTab, secondTab, label } = createTree(document);

      expect(secondTab.matches('[role="tablist"] > [role="tab"]')).toBe(true);
      expect(label.matches('[role="tablist"] span')).toBe(true);
      expect(label.matches('[role="tablist"] > span')).toBe(false);
      expect(secondTab.matches('#overview + button')).toBe(true);
      expect(secondTab.matches('#overview ~ button')).toBe(true);
      expect(firstTab.matches('button + button')).toBe(false);
    });

    it('should evaluate the disabled, enabled and checked pseudo-classes from attributes and properties', () => {
      const { document } = createSelectorFixture();
      const { firstTab, secondTab } = createTree(document);
      const checkbox = document.createElement('input') as HTMLInputElement;
      checkbox.setAttribute('type', 'checkbox');
      checkbox.checked = true;
      const uncheckedWithDefault = document.createElement(
        'input',
      ) as HTMLInputElement;
      uncheckedWithDefault.setAttribute('type', 'checkbox');
      uncheckedWithDefault.setAttribute('checked', '');
      uncheckedWithDefault.checked = false;
      const defaultChecked = document.createElement('input');
      defaultChecked.setAttribute('type', 'radio');
      defaultChecked.setAttribute('checked', '');

      expect(secondTab.matches(':disabled')).toBe(true);
      expect(firstTab.matches(':disabled')).toBe(false);
      expect(firstTab.matches(':enabled')).toBe(true);
      expect(checkbox.matches(':checked')).toBe(true);
      expect(uncheckedWithDefault.matches(':checked')).toBe(false);
      expect(defaultChecked.matches(':checked')).toBe(true);
      expect(firstTab.matches(':checked')).toBe(false);
    });

    it('should evaluate the focus pseudo-classes from the active element', () => {
      const { document, setActiveElement } = createSelectorFixture();
      const { list, firstTab, secondTab } = createTree(document);

      setActiveElement(firstTab);

      expect(firstTab.matches(':focus')).toBe(true);
      expect(firstTab.matches(':focus-visible')).toBe(true);
      expect(list.matches(':focus-within')).toBe(true);
      expect(secondTab.matches(':focus')).toBe(false);
      expect(secondTab.matches(':focus-within')).toBe(false);
      setActiveElement(secondTab);
      expect(firstTab.matches(':focus')).toBe(false);
      expect(secondTab.matches(':focus')).toBe(true);
    });

    it('should inherit fieldset disability except inside the first legend', () => {
      const { document } = createSelectorFixture();
      const outerFieldset = document.createElement('html-fieldset') as Element;
      const firstLegend = document.createElement('html-legend') as Element;
      const firstLegendInput = document.createElement('html-input') as Element;
      const secondLegend = document.createElement('html-legend') as Element;
      const secondLegendInput = document.createElement('html-input') as Element;
      const nestedFieldset = document.createElement('html-fieldset') as Element;
      const nestedLegend = document.createElement('html-legend') as Element;
      const nestedInput = document.createElement('html-input') as Element;

      outerFieldset.setAttribute('disabled', '');
      nestedFieldset.setAttribute('disabled', '');
      firstLegend.append(firstLegendInput);
      secondLegend.append(secondLegendInput);
      nestedLegend.append(nestedInput);
      nestedFieldset.append(nestedLegend);
      outerFieldset.append(firstLegend, secondLegend, nestedFieldset);

      expect(firstLegendInput.matches(':disabled')).toBe(false);
      expect(firstLegendInput.matches(':enabled')).toBe(true);
      expect(secondLegendInput.matches(':disabled')).toBe(true);
      expect(nestedInput.matches(':disabled')).toBe(true);
      expect(firstLegend.matches(':enabled')).toBe(false);

      outerFieldset.removeAttribute('disabled');
      expect(secondLegendInput.matches(':disabled')).toBe(false);
      expect(nestedInput.matches(':disabled')).toBe(false);
    });

    it('should respect disabled optgroups and selected option properties', () => {
      const { document } = createSelectorFixture();
      const group = document.createElement('html-optgroup') as Element;
      const option = document.createElement('html-option') as HTMLOptionElement;
      group.setAttribute('disabled', '');
      group.append(option);
      option.selected = true;

      expect(option.matches(':disabled')).toBe(true);
      expect(option.matches(':checked')).toBe(true);
      option.selected = false;
      expect(option.matches(':checked')).toBe(false);
    });

    it('should inherit disability for nested fieldsets but not options or optgroups', () => {
      const { document } = createSelectorFixture();
      const fieldset = document.createElement('html-fieldset') as Element;
      const nestedFieldset = document.createElement('html-fieldset') as Element;
      const select = document.createElement('html-select') as Element;
      const group = document.createElement('html-optgroup') as Element;
      const option = document.createElement('html-option') as Element;

      fieldset.setAttribute('disabled', '');
      group.append(option);
      select.append(group);
      fieldset.append(nestedFieldset, select);

      expect(nestedFieldset.matches(':disabled')).toBe(true);
      expect(select.matches(':disabled')).toBe(true);
      expect(group.matches(':enabled')).toBe(true);
      expect(option.matches(':enabled')).toBe(true);

      select.setAttribute('disabled', '');
      expect(group.matches(':disabled')).toBe(false);
      expect(option.matches(':disabled')).toBe(false);
    });

    it('should anchor relative has selectors to the candidate', () => {
      const { document } = createSelectorFixture();
      const outer = document.createElement('div');
      const candidate = document.createElement('section');
      const sibling = document.createElement('p');
      const descendant = document.createElement('span');
      outer.setAttribute('class', 'outer');
      candidate.append(descendant);
      outer.append(candidate, sibling);

      expect(candidate.matches(':has(> span)')).toBe(true);
      expect(candidate.matches(':has(+ p)')).toBe(true);
      expect(candidate.matches(':has(~ p)')).toBe(true);
      expect(candidate.matches(':has(.outer span)')).toBe(false);
      expect(candidate.matches(':has(section span)')).toBe(false);
      descendant.remove();
      expect(candidate.matches(':has(> span)')).toBe(false);
    });

    it('should evaluate structural pseudo-classes', () => {
      const { document } = createSelectorFixture();
      const { list, firstTab, secondTab, label } = createTree(document);

      expect(firstTab.matches(':first-child')).toBe(true);
      expect(secondTab.matches(':last-child')).toBe(true);
      expect(label.matches(':only-child')).toBe(true);
      expect(firstTab.matches(':first-of-type')).toBe(true);
      expect(secondTab.matches(':first-of-type')).toBe(false);
      expect(secondTab.matches(':last-of-type')).toBe(true);
      expect(label.matches(':only-of-type')).toBe(true);
      expect(label.matches(':empty')).toBe(true);
      expect(list.matches(':empty')).toBe(false);
      expect(document.documentElement.matches(':root')).toBe(true);
      expect(list.matches(':root')).toBe(false);
    });

    it('should evaluate not, is, where and has', () => {
      const { document } = createSelectorFixture();
      const { list, firstTab, secondTab } = createTree(document);

      expect(firstTab.matches(':not(:disabled)')).toBe(true);
      expect(secondTab.matches(':not(:disabled)')).toBe(false);
      expect(firstTab.matches(':is(span, button)')).toBe(true);
      expect(firstTab.matches(':where(span, .tab)')).toBe(true);
      expect(list.matches(':has(span)')).toBe(true);
      expect(list.matches(':has(input)')).toBe(false);
    });

    it('should treat interaction pseudo-classes that the sandbox cannot observe as unmatched', () => {
      const { document } = createSelectorFixture();
      const { firstTab } = createTree(document);

      expect(firstTab.matches(':hover')).toBe(false);
      expect(firstTab.matches(':active')).toBe(false);
    });

    it('should treat pseudo-classes the sandbox cannot observe as unmatched', () => {
      const { document } = createSelectorFixture();
      const { firstTab } = createTree(document);

      expect(firstTab.matches(':popover-open')).toBe(false);
      expect(firstTab.matches(':modal')).toBe(false);
      expect(firstTab.matches(':host')).toBe(false);
      expect(firstTab.matches(':state(pressed)')).toBe(false);
      expect(firstTab.matches(':-webkit-autofill')).toBe(false);
      expect(firstTab.matches(':not(:popover-open)')).toBe(true);
    });

    it('should throw a SyntaxError DOMException for an invalid selector', () => {
      const { document } = createSelectorFixture();
      const { firstTab } = createTree(document);

      expect(() => firstTab.matches(':unknown-pseudo')).toThrow(
        expect.objectContaining({ name: 'SyntaxError' }),
      );
    });
  });

  describe('closest', () => {
    it('should return the element itself when it matches', () => {
      const { document } = createSelectorFixture();
      const { firstTab } = createTree(document);

      expect(firstTab.closest('[role="tab"]')).toBe(firstTab);
    });

    it('should walk up to the nearest matching ancestor', () => {
      const { document } = createSelectorFixture();
      const { list, label } = createTree(document);

      expect(label.closest('[role="tablist"]')).toBe(list);
    });

    it('should return null when no ancestor matches', () => {
      const { document } = createSelectorFixture();
      const { label } = createTree(document);

      expect(label.closest('[hidden], [inert]')).toBeNull();
    });
  });

  describe('querySelector and querySelectorAll', () => {
    it('should decode CSS escapes in identifiers and attribute strings', () => {
      const { document } = createSelectorFixture();
      const target = document.createElement('html-button') as Element;
      target.setAttribute('id', '123');
      target.setAttribute('class', 'sm:flex');
      target.setAttribute('data-label', 'ABC');
      document.body.append(target);

      expect(document.querySelector(String.raw`#\31 23`)).toBe(target);
      expect(document.querySelector(String.raw`.sm\:flex`)).toBe(target);
      expect(document.querySelector(String.raw`[data-label="\41 BC"]`)).toBe(
        target,
      );
    });

    it.each([
      '',
      ' ',
      'div,',
      '> div',
      'div >',
      '[',
      ':unknown-pseudo',
      ':not(',
      ':disabled(x)',
    ])(
      'should reject invalid selector %p through the DOM interface',
      (selector) => {
        const { document } = createSelectorFixture();

        expect(() => document.querySelector(selector)).toThrow(
          expect.objectContaining({ name: 'SyntaxError' }),
        );
      },
    );

    it('should resolve document scope and support structural selector arguments', () => {
      const { document } = createSelectorFixture();
      const { list, secondTab } = createTree(document);

      expect(document.querySelector(':scope')).toBe(document.documentElement);
      expect(list.querySelector('button:nth-child(2)')).toBe(secondTab);
      expect(list.querySelector('body button:nth-child(2)')).toBe(secondTab);
    });

    it('should query descendants in document order from an element', () => {
      const { document } = createSelectorFixture();
      const { list, firstTab, secondTab } = createTree(document);

      const tabs = list.querySelectorAll('[role="tab"]');

      expect(Array.from(tabs)).toEqual([firstTab, secondTab]);
      expect(tabs.item(0)).toBe(firstTab);
      expect(list.querySelector(':disabled')).toBe(secondTab);
      expect(list.querySelector('input')).toBeNull();
    });

    it('should query from the document', () => {
      const { document } = createSelectorFixture();
      const { list, label } = createTree(document);

      expect(document.querySelector('[role="tablist"]')).toBe(list);
      expect(document.querySelectorAll('span')).toHaveLength(1);
      expect(document.querySelector('span')).toBe(label);
    });

    it('should not match the scope element itself', () => {
      const { document } = createSelectorFixture();
      const { list } = createTree(document);

      expect(list.querySelectorAll('[role="tablist"]')).toHaveLength(0);
    });

    it('should resolve :scope to the query root', () => {
      const { document } = createSelectorFixture();
      const { list, firstTab, secondTab } = createTree(document);

      expect(Array.from(list.querySelectorAll(':scope > button'))).toEqual([
        firstTab,
        secondTab,
      ]);
    });

    it('should support the tabbable candidate selector', () => {
      const { document } = createSelectorFixture();
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      const input = document.createElement('html-input') as Element;
      details.append(summary);
      document.body.append(details, input);

      const candidates = document.querySelectorAll(
        'input,select,textarea,a[href],button,[tabindex],audio[controls],video[controls],[contenteditable]:not([contenteditable="false"]),details>summary:first-of-type,details',
      );

      expect(Array.from(candidates)).toEqual([details, summary, input]);
    });
  });

  describe('sub-selectors outside the scope subtree', () => {
    it('should match ancestors through :is, :where and :not', () => {
      const { document } = createSelectorFixture();
      const { list, firstTab, secondTab, label } = createTree(document);
      const container = document.createElement('div');
      container.setAttribute('class', 'foo');
      document.body.append(container);
      container.append(list);

      expect(firstTab.closest(':is(.foo)')).toBe(container);
      expect(label.closest(':where([role="tablist"])')).toBe(list);
      expect(label.closest('button:not([disabled])')).toBeNull();
      expect(secondTab.matches(':not([role="tablist"]) > button')).toBe(false);
      expect(secondTab.matches(':is([role="tablist"]) > button')).toBe(true);
      expect(label.matches(':is(.foo) span')).toBe(true);
      expect(Array.from(list.querySelectorAll(':is(body) button'))).toEqual([
        firstTab,
        secondTab,
      ]);
    });

    it('should not treat a tabindex="-1" popup ancestor as interactive', () => {
      const { document } = createSelectorFixture();
      const popup = document.createElement('div');
      const content = document.createElement('div');
      const text = document.createElement('span');
      popup.setAttribute('tabindex', '-1');
      popup.append(content);
      content.append(text);
      document.body.append(popup);

      expect(
        text.closest(
          'button,a[href],[role="button"],select,[tabindex]:not([tabindex="-1"]),input:not([type=\'hidden\']):not([disabled]),textarea:not([disabled]),[contenteditable]:not([contenteditable=\'false\'])',
        ),
      ).toBeNull();
    });

    it('should keep relative :has arguments anchored to the candidate', () => {
      const { document } = createSelectorFixture();
      const { list, firstTab, secondTab, label } = createTree(document);

      expect(Array.from(list.querySelectorAll(':has(> span)'))).toEqual([
        secondTab,
      ]);
      expect(label.closest(':has(> span)')).toBe(secondTab);
      expect(
        Array.from(document.querySelectorAll('button:has(+ button)')),
      ).toEqual([firstTab]);
    });

    it('should exclude the scoping root from document-scoped :scope queries', () => {
      const { document } = createSelectorFixture();

      const descendants = Array.from(document.querySelectorAll(':scope *'));

      expect(descendants).not.toContain(document.documentElement);
      expect(descendants).toContain(document.body);
    });

    it('should resolve :scope per call when the same selector is reused', () => {
      const { document } = createSelectorFixture();
      const { list, firstTab, secondTab } = createTree(document);

      expect(Array.from(list.querySelectorAll(':scope > button'))).toEqual([
        firstTab,
        secondTab,
      ]);
      expect(Array.from(firstTab.querySelectorAll(':scope > button'))).toEqual(
        [],
      );
      expect(firstTab.matches(':scope')).toBe(true);
      expect(secondTab.matches(':scope')).toBe(true);
      expect(firstTab.matches(':not(:scope)')).toBe(false);
    });
  });

  describe('attribute selectors', () => {
    it('should match attribute names case-insensitively', () => {
      const { document } = createSelectorFixture();
      const { firstTab } = createTree(document);
      firstTab.setAttribute('data-testId', 'abc');
      firstTab.setAttribute('contentEditable', '');

      expect(firstTab.matches('[data-testId="abc"]')).toBe(true);
      expect(firstTab.matches('[data-testid="abc"]')).toBe(true);
      expect(document.querySelector('[data-testid]')).toBe(firstTab);
      expect(
        firstTab.matches('[contenteditable]:not([contenteditable="false"])'),
      ).toBe(true);
    });

    it('should not treat inherited element accessors as attributes', () => {
      const { document } = createSelectorFixture();
      const { firstTab } = createTree(document);

      expect(firstTab.matches('[slot]')).toBe(false);
      expect(firstTab.matches(':not([slot])')).toBe(true);
      expect(document.querySelectorAll('[slot]')).toHaveLength(0);
      firstTab.setAttribute('slot', 'actions');
      expect(firstTab.matches('[slot="actions"]')).toBe(true);
    });
  });

  describe('control state pseudo-classes', () => {
    it('should restrict :checked to checkable inputs and options', () => {
      const { document } = createSelectorFixture();
      const checkedDiv = document.createElement('div');
      const checkedText = document.createElement('input');
      const checkedRadio = document.createElement('input');
      const selectedOption = document.createElement(
        'option',
      ) as HTMLOptionElement;
      checkedDiv.setAttribute('checked', '');
      checkedText.setAttribute('type', 'text');
      checkedText.setAttribute('checked', '');
      checkedRadio.setAttribute('type', 'RADIO');
      checkedRadio.setAttribute('checked', '');
      selectedOption.selected = true;
      document.body.append(
        checkedDiv,
        checkedText,
        checkedRadio,
        selectedOption,
      );

      expect(checkedDiv.matches(':checked')).toBe(false);
      expect(checkedText.matches(':checked')).toBe(false);
      expect(checkedRadio.matches(':checked')).toBe(true);
      expect(selectedOption.matches(':checked')).toBe(true);
      expect(Array.from(document.querySelectorAll(':checked'))).toEqual([
        checkedRadio,
        selectedOption,
      ]);
    });

    it('should evaluate :read-only, :read-write and :placeholder-shown', () => {
      const { document } = createSelectorFixture();
      const { firstTab } = createTree(document);
      const textInput = document.createElement('input') as HTMLInputElement;
      const readOnlyInput = document.createElement('input');
      const disabledTextarea = document.createElement('textarea');
      const editor = document.createElement('div');
      const nestedEditorText = document.createElement('span');
      readOnlyInput.setAttribute('readonly', '');
      disabledTextarea.setAttribute('disabled', '');
      editor.setAttribute('contenteditable', 'true');
      editor.append(nestedEditorText);
      textInput.setAttribute('placeholder', 'Search');
      document.body.append(textInput, readOnlyInput, disabledTextarea, editor);

      expect(firstTab.matches(':read-only')).toBe(true);
      expect(textInput.matches(':read-write')).toBe(true);
      expect(readOnlyInput.matches(':read-only')).toBe(true);
      expect(disabledTextarea.matches(':read-only')).toBe(true);
      expect(nestedEditorText.matches(':read-write')).toBe(true);
      expect(textInput.matches(':placeholder-shown')).toBe(true);
      textInput.value = 'acme';
      expect(textInput.matches(':placeholder-shown')).toBe(false);
    });

    it('should evaluate :indeterminate, :valid, :open and :defined', () => {
      const { document } = createSelectorFixture();
      const checkbox = document.createElement('input') as HTMLInputElement;
      const progress = document.createElement('progress');
      const details = document.createElement('details');
      const plainDiv = document.createElement('div');
      checkbox.setAttribute('type', 'checkbox');
      checkbox.indeterminate = true;
      details.setAttribute('open', '');
      document.body.append(checkbox, progress, details, plainDiv);

      expect(checkbox.matches(':indeterminate')).toBe(true);
      expect(progress.matches(':indeterminate')).toBe(true);
      expect(plainDiv.matches(':indeterminate')).toBe(false);
      expect(checkbox.matches(':valid')).toBe(false);
      expect(checkbox.matches(':invalid')).toBe(false);
      expect(details.matches(':open')).toBe(true);
      expect(plainDiv.matches(':open')).toBe(false);
      expect(plainDiv.matches(':defined')).toBe(true);
    });

    it('should evaluate :lang and :dir from the nearest ancestor attributes', () => {
      const { document } = createSelectorFixture();
      const article = document.createElement('article');
      const paragraph = document.createElement('p');
      const quote = document.createElement('q');
      article.setAttribute('lang', 'en-US');
      article.setAttribute('dir', 'rtl');
      quote.setAttribute('lang', 'fr');
      article.append(paragraph);
      paragraph.append(quote);
      document.body.append(article);

      expect(paragraph.matches(':lang(en)')).toBe(true);
      expect(paragraph.matches(':lang("en-US")')).toBe(true);
      expect(paragraph.matches(':lang(fr, en)')).toBe(true);
      expect(paragraph.matches(':lang(fr)')).toBe(false);
      expect(quote.matches(':lang(fr)')).toBe(true);
      expect(document.body.matches(':lang(en)')).toBe(false);
      expect(paragraph.matches(':dir(rtl)')).toBe(true);
      expect(paragraph.matches(':dir(ltr)')).toBe(false);
      expect(document.body.matches(':dir(ltr)')).toBe(true);
    });

    it('should derive the checked option from the select value or its first enabled option', () => {
      const { document } = createSelectorFixture();
      const createSelect = (optionValues: string[]) => {
        const select = document.createElement('select') as unknown as Element &
          Record<string, unknown>;
        const options = optionValues.map((optionValue) => {
          const option = document.createElement('option');

          option.setAttribute('value', optionValue);

          return option;
        });

        select.append(...options);
        document.body.append(select);

        return { select, options };
      };

      const controlledSelect = createSelect(['first', 'second']);
      controlledSelect.select.value = 'second';

      const uncontrolledSelect = createSelect(['first', 'second']);
      uncontrolledSelect.options[0].setAttribute('disabled', '');

      const multipleSelect = createSelect(['first', 'second']);
      multipleSelect.select.setAttribute('multiple', '');

      expect(controlledSelect.select.querySelector('option:checked')).toBe(
        controlledSelect.options[1],
      );
      expect(uncontrolledSelect.select.querySelector('option:checked')).toBe(
        uncontrolledSelect.options[1],
      );
      expect(multipleSelect.select.querySelector('option:checked')).toBeNull();
    });

    it('should evaluate :required, :optional, :any-link and :link', () => {
      const { document } = createSelectorFixture();
      const requiredInput = document.createElement('input');
      const optionalSelect = document.createElement('select');
      const link = document.createElement('a');
      const placeholderLink = document.createElement('a');
      requiredInput.setAttribute('required', '');
      link.setAttribute('href', '/records');
      document.body.append(
        requiredInput,
        optionalSelect,
        link,
        placeholderLink,
      );

      expect(requiredInput.matches(':required')).toBe(true);
      expect(requiredInput.matches(':optional')).toBe(false);
      expect(optionalSelect.matches(':optional')).toBe(true);
      expect(link.matches(':any-link')).toBe(true);
      expect(link.matches(':link')).toBe(true);
      expect(placeholderLink.matches(':any-link')).toBe(false);
    });
  });

  describe('sibling arguments of :has', () => {
    it('should keep nested selector lists relative to the sibling instead of the :has subject', () => {
      const { document } = createSelectorFixture();
      const list = document.createElement('ul');
      const [first, second, third] = ['first', 'second', 'third'].map(
        (itemId) => {
          const item = document.createElement('li');

          item.setAttribute('id', itemId);

          return item;
        },
      );
      const label = document.createElement('label');
      const requiredInput = document.createElement('input');
      second.setAttribute('class', 'hidden');
      requiredInput.setAttribute('required', '');
      list.append(first, second, third);
      document.body.append(list, label, requiredInput);

      expect(Array.from(list.querySelectorAll('li:has(+ :is(li))'))).toEqual([
        first,
        second,
      ]);
      expect(
        Array.from(list.querySelectorAll('li:has(~ :where(#third))')),
      ).toEqual([first, second]);
      expect(
        Array.from(list.querySelectorAll('li:has(+ :not(.hidden))')),
      ).toEqual([second]);
      expect(label.matches('label:has(+ :required)')).toBe(true);
    });
  });

  describe('selector validity', () => {
    it('should accept pseudo-elements in the last compound and never match them', () => {
      const { document } = createSelectorFixture();
      const { list, firstTab } = createTree(document);

      expect(firstTab.matches('button::before')).toBe(false);
      expect(firstTab.matches('button:before')).toBe(false);
      expect(firstTab.matches('::placeholder, button')).toBe(true);
      expect(Array.from(list.querySelectorAll('button::after'))).toEqual([]);
      expect(() => firstTab.matches('div::before button')).toThrow(
        expect.objectContaining({ name: 'SyntaxError' }),
      );
      expect(() => firstTab.matches(':not(::before)')).toThrow(
        expect.objectContaining({ name: 'SyntaxError' }),
      );
    });

    it('should drop unsupported arguments from forgiving :is and :where lists', () => {
      const { document } = createSelectorFixture();
      const { firstTab } = createTree(document);

      expect(firstTab.matches(':is(.active, :unknown-pseudo)')).toBe(true);
      expect(firstTab.matches(':where(:unknown-pseudo)')).toBe(false);
      expect(() => firstTab.matches(':not(.active, :unknown-pseudo)')).toThrow(
        expect.objectContaining({ name: 'SyntaxError' }),
      );
    });

    it('should support the any and empty namespaces and reject named ones', () => {
      const { document } = createSelectorFixture();
      const { firstTab } = createTree(document);

      expect(firstTab.matches('*|button')).toBe(true);
      expect(firstTab.matches('[*|role="tab"]')).toBe(true);
      expect(firstTab.matches('|button')).toBe(false);
      expect(() => firstTab.matches('svg|button')).toThrow(
        expect.objectContaining({ name: 'SyntaxError' }),
      );
    });

    it('should count :nth-child and :nth-last-child among siblings matching the of selector', () => {
      const { document } = createSelectorFixture();
      const { list, firstTab, secondTab } = createTree(document);
      const thirdTab = document.createElement('button');
      thirdTab.setAttribute('class', 'tab');
      list.append(thirdTab);

      expect(secondTab.matches(':nth-child(2 of .tab)')).toBe(true);
      expect(thirdTab.matches(':nth-child(odd of .tab)')).toBe(true);
      expect(firstTab.matches(':nth-last-child(3 of .tab)')).toBe(true);
      expect(firstTab.matches(':nth-child(2 of .tab)')).toBe(false);
      expect(() =>
        firstTab.matches(':nth-child(2 of :unknown-pseudo)'),
      ).toThrow(expect.objectContaining({ name: 'SyntaxError' }));
    });

    it('should skip parentheses inside quoted strings of an of selector', () => {
      const { document } = createSelectorFixture();
      const { firstTab, secondTab } = createTree(document);
      firstTab.setAttribute('data-label', ')');
      secondTab.setAttribute('data-label', '(');

      expect(firstTab.matches(':nth-child(1 of [data-label=")"])')).toBe(true);
      expect(secondTab.matches(":nth-child(1 of [data-label='('])")).toBe(true);
      expect(() =>
        firstTab.matches(':nth-child(1 of [data-label=")"]'),
      ).toThrow(expect.objectContaining({ name: 'SyntaxError' }));
    });

    it('should reject non-standard and nested :has selectors', () => {
      const { document } = createSelectorFixture();
      const { firstTab } = createTree(document);

      for (const selectorsText of [
        ':defined(tab)',
        ':button',
        ':contains(Overview)',
        'div < button',
        ':has(:has(span))',
      ]) {
        expect(() => firstTab.matches(selectorsText)).toThrow(
          expect.objectContaining({ name: 'SyntaxError' }),
        );
      }
    });
  });

  describe(':root', () => {
    it('should match only the document element', () => {
      const { document } = createSelectorFixture();
      const detached = document.createElement('div');
      const detachedChild = document.createElement('span');
      const fragment = document.createDocumentFragment();
      const fragmentChild = document.createElement('div');
      detached.append(detachedChild);
      fragment.append(fragmentChild);

      expect(document.documentElement.matches(':root')).toBe(true);
      expect(detached.matches(':root')).toBe(false);
      expect(detachedChild.closest(':root')).toBeNull();
      expect(fragmentChild.matches(':root')).toBe(false);
    });
  });

  describe('DocumentFragment', () => {
    it('should query fragments with the worker selector engine', () => {
      const { document } = createSelectorFixture();
      const fragment = document.createDocumentFragment();
      const button = document.createElement('html-button') as Element;
      const span = document.createElement('span');
      button.setAttribute('disabled', '');
      fragment.append(button, span);

      expect(fragment.querySelector(':disabled')).toBe(button);
      expect(fragment.querySelector('button')).toBe(button);
      expect(
        Array.from(fragment.querySelectorAll('span:first-of-type')),
      ).toEqual([span]);
    });
  });
});
