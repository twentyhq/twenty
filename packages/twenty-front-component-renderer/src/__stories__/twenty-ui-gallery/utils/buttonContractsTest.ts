import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { expect, userEvent, waitFor, within } from 'storybook/test';

export const buttonContractsTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const nativeButton = await canvas.findByRole(
    'button',
    { name: 'Custom native button' },
    { timeout: 10000 },
  );

  await waitFor(() =>
    expect(nativeButton.getBoundingClientRect().height).toBe(32),
  );

  await expect(nativeButton.tagName).toBe('BUTTON');
  await expect(nativeButton).toHaveAttribute('type', 'button');
  await userEvent.click(nativeButton);
  nativeButton.focus();
  await userEvent.keyboard('{Enter}');
  await waitFor(() => {
    expect(
      canvas.getByLabelText('Native button activations'),
    ).toHaveTextContent('2');
    expect(canvas.getByLabelText('Button click details')).toHaveTextContent(
      'native-button:click:0:function',
    );
  });

  const elementLink = canvas.getByRole('link', {
    name: 'Composed download link',
  });

  await expect(elementLink.tagName).toBe('A');
  await expect(elementLink).toHaveAttribute('href', '#composed-button-link');
  await expect(elementLink).toHaveAttribute('hreflang', 'fr');
  await expect(elementLink).toHaveAttribute('media', 'screen');
  await expect(elementLink).toHaveAttribute('type', 'text/plain');
  await expect(elementLink).toHaveAttribute('ping', 'https://twenty.com/ping');
  await expect(elementLink).toHaveAttribute('referrerpolicy', 'no-referrer');
  await expect(elementLink).toHaveAttribute('download', 'button-contract.txt');

  await expect(
    canvas.getByRole('link', { name: 'Download without filename' }),
  ).toHaveAttribute('download', '');

  const callbackLink = canvas.getByRole('link', {
    name: 'Callback rendered link',
  });

  await expect(callbackLink.tagName).toBe('A');
  await expect(callbackLink).toHaveAttribute('href', '#callback-button-link');
  await expect(callbackLink).toHaveAttribute('data-render-disabled', 'false');
  await userEvent.click(callbackLink);
  await waitFor(() => {
    expect(
      canvas.getByLabelText('Callback link activations'),
    ).toHaveTextContent('1');
    expect(canvas.getByLabelText('Button click details')).toHaveTextContent(
      'callback-link:click:0:function',
    );
  });

  await userEvent.click(
    canvas.getByRole('button', { name: 'Labelled icon action' }),
  );
  await waitFor(() =>
    expect(
      canvas.getByLabelText('Labelled icon activations'),
    ).toHaveTextContent('1'),
  );

  for (const name of ['Inherited appearance', 'Inherited icon appearance']) {
    const inherited = canvas.getByRole('button', { name });

    await expect(inherited).toHaveAttribute('data-variant', 'solid');
    await expect(inherited).toHaveAttribute('data-color', 'danger');
    await expect(inherited.getBoundingClientRect().height).toBe(24);
  }

  const explicitButton = canvas.getByRole('button', {
    name: 'Explicit appearance',
  });
  const explicitIcon = canvas.getByRole('button', {
    name: 'Explicit icon appearance',
  });

  await expect(explicitButton).toHaveAttribute('data-variant', 'ghost');
  await expect(explicitButton).toHaveAttribute('data-color', 'success');
  await expect(explicitButton.getBoundingClientRect().height).toBe(32);
  await expect(explicitIcon).toHaveAttribute('data-variant', 'outline');
  await expect(explicitIcon).toHaveAttribute('data-color', 'accent');
  await expect(explicitIcon.getBoundingClientRect().height).toBe(20);
  await expect(explicitIcon.getBoundingClientRect().width).toBe(20);

  const centerLoadingButton = canvas.getByRole('button', {
    name: 'Preserve center content width',
  });
  const initialWidth = centerLoadingButton.getBoundingClientRect().width;
  const toggleCenterLoading = canvas.getByRole('button', {
    name: 'Toggle center loading',
  });

  await userEvent.click(toggleCenterLoading);
  await waitFor(() => {
    expect(centerLoadingButton).toBeDisabled();
    expect(centerLoadingButton).toHaveAttribute('aria-busy', 'true');
    expect(centerLoadingButton.getBoundingClientRect().width).toBe(
      initialWidth,
    );
  });
  await userEvent.click(toggleCenterLoading);
  await waitFor(() => expect(centerLoadingButton).toBeEnabled());

  for (const name of ['Loading at start', 'Loading at end']) {
    const loadingButton = canvas.getByRole('button', { name });

    await expect(loadingButton).toBeDisabled();
    await expect(loadingButton).toHaveAttribute('aria-busy', 'true');
  }

  await expect(
    canvas.queryByTestId('start-loading-original-icon'),
  ).not.toBeInTheDocument();
  await expect(
    canvas.queryByTestId('end-loading-original-icon'),
  ).not.toBeInTheDocument();
  await expect(
    canvas.getByTestId('start-loading-retained-icon'),
  ).toBeInTheDocument();
  await expect(
    canvas.getByTestId('end-loading-retained-icon'),
  ).toBeInTheDocument();

  await expect(nativeButton).toHaveAttribute(
    'data-ref-target',
    'native-button',
  );
  await expect(elementLink).toHaveAttribute('data-ref-target', 'element-link');
  await expect(elementLink).toHaveAttribute(
    'data-render-ref-target',
    'element-link',
  );
  await expect(callbackLink).toHaveAttribute(
    'data-ref-target',
    'callback-link',
  );
};
