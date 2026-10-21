import { expect, spyOn, userEvent, waitFor } from 'storybook/test';

// window.open is the redirect useTriggerAppOAuth performs; stubbing it keeps the story on the page
export const clickAndCaptureOAuthRedirect = async (element: HTMLElement) => {
  const openWindow = spyOn(window, 'open').mockImplementation(() => null);

  try {
    await userEvent.click(element);
    await waitFor(() => expect(openWindow).toHaveBeenCalledTimes(1));

    const [redirectUrl, target] = openWindow.mock.calls[0];

    expect(target).toBe('_self');

    return new URL(String(redirectUrl));
  } finally {
    openWindow.mockRestore();
  }
};
