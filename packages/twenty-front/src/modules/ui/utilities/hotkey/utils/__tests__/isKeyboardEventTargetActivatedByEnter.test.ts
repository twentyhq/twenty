import { isKeyboardEventTargetActivatedByEnter } from '@/ui/utilities/hotkey/utils/isKeyboardEventTargetActivatedByEnter';

const pressEnterOn = (target: EventTarget) => {
  const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });

  target.dispatchEvent(keyboardEvent);

  return keyboardEvent;
};

const createElementFromHtml = (html: string) => {
  const container = document.createElement('div');

  container.innerHTML = html;

  return container.firstElementChild as Element;
};

describe('isKeyboardEventTargetActivatedByEnter', () => {
  it.each([
    ['a native button', '<button type="button">Next</button>'],
    ['a role="button" element', '<div role="button" tabindex="0">Next</div>'],
    ['a link', '<a href="/companies">Companies</a>'],
    ['a role="link" element', '<span role="link" tabindex="0">Docs</span>'],
  ])('is true for Enter pressed on %s', (_, html) => {
    expect(
      isKeyboardEventTargetActivatedByEnter(
        pressEnterOn(createElementFromHtml(html)),
      ),
    ).toBe(true);
  });

  it.each([
    ['a text input', '<input type="text" />'],
    ['a textarea', '<textarea></textarea>'],
    ['a contenteditable element', '<div contenteditable="true"></div>'],
    ['an anchor without href', '<a>Placeholder</a>'],
    ['a calendar day cell', '<div role="gridcell" tabindex="0">12</div>'],
  ])('is false for Enter pressed on %s', (_, html) => {
    expect(
      isKeyboardEventTargetActivatedByEnter(
        pressEnterOn(createElementFromHtml(html)),
      ),
    ).toBe(false);
  });

  it('is false for Enter pressed on a text input inside a role="button" element', () => {
    const wrapper = createElementFromHtml(
      '<div role="button"><input type="text" /></div>',
    );

    expect(
      isKeyboardEventTargetActivatedByEnter(
        pressEnterOn(wrapper.querySelector('input') as HTMLInputElement),
      ),
    ).toBe(false);
  });

  it('is false for Enter dispatched on the document', () => {
    expect(isKeyboardEventTargetActivatedByEnter(pressEnterOn(document))).toBe(
      false,
    );
  });
});
