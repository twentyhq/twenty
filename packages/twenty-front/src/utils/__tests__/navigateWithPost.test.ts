import { navigateWithPost } from '~/utils/navigateWithPost';

describe('navigateWithPost', () => {
  it('submits a POST form to the given url', () => {
    const submit = jest
      .spyOn(HTMLFormElement.prototype, 'submit')
      .mockImplementation(() => undefined);

    navigateWithPost('https://api.example.com/start?token=abc');

    const form = document.body.querySelector('form');

    expect(form?.method).toBe('post');
    expect(form?.action).toBe('https://api.example.com/start?token=abc');
    expect(submit).toHaveBeenCalledTimes(1);

    submit.mockRestore();
    form?.remove();
  });
});
