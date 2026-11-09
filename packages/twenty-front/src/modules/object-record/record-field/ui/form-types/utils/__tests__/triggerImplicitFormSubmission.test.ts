import { triggerImplicitFormSubmission } from '@/object-record/record-field/ui/form-types/utils/triggerImplicitFormSubmission';

const setupForm = (markup: string) => {
  document.body.innerHTML = markup;

  const onSubmit = jest.fn((event: Event) => event.preventDefault());
  document.querySelector('form')?.addEventListener('submit', onSubmit);

  return {
    onSubmit,
    editor: document.querySelector('[contenteditable]') as HTMLElement,
  };
};

describe('triggerImplicitFormSubmission', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('should submit the closest form through its default button', () => {
    const { onSubmit, editor } = setupForm(`
      <form>
        <div contenteditable="true"></div>
        <button type="button">Skip</button>
        <button type="submit">Submit</button>
      </form>
    `);

    triggerImplicitFormSubmission(editor);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('should use a submit button associated through the form attribute', () => {
    document.body.innerHTML = `
      <form id="step-form"><div contenteditable="true"></div></form>
      <button type="submit" form="step-form">Submit</button>
    `;
    const onClick = jest.fn();
    document.querySelector('button')?.addEventListener('click', onClick);
    document
      .querySelector('form')
      ?.addEventListener('submit', (event) => event.preventDefault());

    triggerImplicitFormSubmission(
      document.querySelector('[contenteditable]') as HTMLElement,
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should not submit when the default button is disabled', () => {
    const { onSubmit, editor } = setupForm(`
      <form>
        <div contenteditable="true"></div>
        <button type="submit" disabled>Submit</button>
      </form>
    `);

    triggerImplicitFormSubmission(editor);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should do nothing outside a form', () => {
    document.body.innerHTML = '<div contenteditable="true"></div>';

    expect(() =>
      triggerImplicitFormSubmission(
        document.querySelector('[contenteditable]') as HTMLElement,
      ),
    ).not.toThrow();
  });
});
