import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const badgeTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const nodeContent = canvas.getByLabelText('Node content badge');
  expect(nodeContent.tagName).toBe('SPAN');
  expect(within(nodeContent).getByText('Node content').tagName).toBe('STRONG');
  expect(nodeContent.querySelector('svg')).toBeVisible();
  expect(nodeContent).not.toHaveAttribute('role');
  expect(nodeContent).not.toHaveAttribute('tabindex');

  const extraSmall = canvas.getByLabelText('Extra small badge');
  const small = canvas.getByLabelText('Small badge');
  const medium = canvas.getByLabelText('Medium badge');
  const primaryCircle = canvas.getByLabelText('Primary circle badge');
  const secondaryCircle = canvas.getByLabelText('Secondary circle badge');
  const inherited = canvas.getByLabelText('Inherited badge');

  await waitFor(() => {
    expect(extraSmall).toHaveStyle({ height: '14px' });
    expect(small).toHaveStyle({ height: '16px' });
    expect(medium).toHaveStyle({ height: '18px' });
    expect(primaryCircle.getBoundingClientRect().width).toBe(
      primaryCircle.getBoundingClientRect().height,
    );
    expect(getComputedStyle(primaryCircle).borderRadius).toBe('50%');
    expect(getComputedStyle(primaryCircle).backgroundColor).not.toBe(
      getComputedStyle(secondaryCircle).backgroundColor,
    );
    expect(getComputedStyle(small).color).not.toBe(
      getComputedStyle(secondaryCircle).color,
    );
    expect(getComputedStyle(primaryCircle).color).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(inherited).color).toBe('rgb(20, 80, 120)');
    expect(getComputedStyle(inherited).fontWeight).toBe('600');
  });
  expect(small.getBoundingClientRect().width).toBeGreaterThan(
    small.getBoundingClientRect().height,
  );
  expect(canvas.getByLabelText('Caller supplied zero')).toHaveTextContent('0');
  expect(canvas.getByLabelText('Unread messages')).toHaveTextContent('3');
  await userEvent.click(
    canvas.getByRole('button', { name: 'Load large count' }),
  );
  await waitFor(() =>
    expect(canvas.getByLabelText('Unread messages')).toHaveTextContent('99+'),
  );
  await userEvent.click(canvas.getByRole('button', { name: 'Clear count' }));
  await waitFor(() =>
    expect(canvas.queryByLabelText('Unread messages')).not.toBeInTheDocument(),
  );
  expect(canvas.getByLabelText('Caller supplied zero')).toHaveTextContent('0');

  const nativeRoot = canvas.getByLabelText('Native badge');
  expect(nativeRoot.tagName).toBe('SPAN');
  expect(nativeRoot).toHaveAttribute('id', 'native-badge');
  expect(nativeRoot).toHaveAttribute('title', 'Native badge title');
  expect(nativeRoot).toHaveAttribute('lang', 'fr');
  expect(nativeRoot).toHaveAttribute('dir', 'rtl');
  expect(nativeRoot).toHaveClass('custom-badge');
  expect(nativeRoot).toHaveStyle({ marginInlineStart: '7px' });
  await waitFor(() =>
    expect(nativeRoot).toHaveAttribute('data-ref-tag', 'HTML-SPAN'),
  );
  await userEvent.hover(nativeRoot);
  await waitFor(() =>
    expect(
      canvas.getByLabelText('Native badge pointer entries'),
    ).toHaveTextContent('1'),
  );

  const button = canvas.getByRole('button', { name: 'Open badge details' });
  expect(button).toHaveAttribute('type', 'button');
  expect(button).toHaveAttribute('data-composed', 'button');
  await waitFor(() =>
    expect(button).toHaveAttribute('data-ref-tag', 'HTML-BUTTON'),
  );
  await userEvent.click(button);
  await userEvent.keyboard('{Enter} ');
  await waitFor(() => {
    expect(canvas.getByLabelText('Badge button activations')).toHaveTextContent(
      '3',
    );
    expect(
      canvas.getByLabelText('Rendered button activations'),
    ).toHaveTextContent('3');
  });
  expect(button).toHaveFocus();

  const link = canvas.getByRole('link', { name: 'Badge documentation' });
  expect(link).toHaveAttribute('href', '#badge-docs');
  expect(link).toHaveAttribute('target', '_self');
  expect(link).toHaveAttribute('data-composed', 'link');
  await waitFor(() => expect(link).toHaveAttribute('data-ref-tag', 'HTML-A'));
  await userEvent.click(link);
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(canvas.getByLabelText('Badge link activations')).toHaveTextContent(
      '2',
    ),
  );
  expect(link).toHaveFocus();
  expect(errorHandler).not.toHaveBeenCalled();
};
