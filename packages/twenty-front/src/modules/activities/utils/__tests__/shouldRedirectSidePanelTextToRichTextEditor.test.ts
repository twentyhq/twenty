import { shouldRedirectSidePanelTextToRichTextEditor } from '@/activities/utils/shouldRedirectSidePanelTextToRichTextEditor';

const getShouldRedirectForTarget = (
  target: HTMLElement,
  keyboardEventInit: KeyboardEventInit = { key: 'a' },
) => {
  let shouldRedirect = false;

  target.addEventListener(
    'keydown',
    (event) => {
      shouldRedirect = shouldRedirectSidePanelTextToRichTextEditor(event);
    },
    { once: true },
  );

  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      bubbles: true,
      ...keyboardEventInit,
    }),
  );

  return shouldRedirect;
};

describe('shouldRedirectSidePanelTextToRichTextEditor', () => {
  it('does not redirect text typed in a form control', () => {
    expect(getShouldRedirectForTarget(document.createElement('input'))).toBe(
      false,
    );
    expect(getShouldRedirectForTarget(document.createElement('textarea'))).toBe(
      false,
    );
    expect(getShouldRedirectForTarget(document.createElement('select'))).toBe(
      false,
    );
  });

  it('does not redirect text typed in a content-editable element', () => {
    const editor = document.createElement('div');
    const textNode = document.createElement('span');

    editor.setAttribute('contenteditable', 'true');
    editor.append(textNode);

    expect(getShouldRedirectForTarget(textNode)).toBe(false);
  });

  it('redirects unmodified text typed outside an editable element', () => {
    expect(getShouldRedirectForTarget(document.createElement('div'))).toBe(
      true,
    );
  });

  it('does not redirect shortcuts or non-writing keys', () => {
    const target = document.createElement('div');

    expect(
      getShouldRedirectForTarget(target, { key: 'a', metaKey: true }),
    ).toBe(false);
    expect(getShouldRedirectForTarget(target, { key: 'ArrowDown' })).toBe(
      false,
    );
  });
});
