import { expect, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

export const avatarGroupTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const supplied = canvas.getByRole('group', { name: 'Supplied avatars' });
  expect(within(supplied).getAllByRole('img')).toHaveLength(3);
  expect(within(supplied).getByText('+5')).toBeVisible();
  const partiallyLoaded = canvas.getByRole('group', {
    name: 'Partially loaded avatars',
  });
  expect(within(partiallyLoaded).getAllByRole('img')).toHaveLength(3);
  expect(within(partiallyLoaded).getByText('+17')).toBeVisible();
  const custom = canvas.getByRole('group', { name: 'Custom overflow' });
  expect(within(custom).getAllByRole('img')).toHaveLength(3);
  expect(
    within(custom).getByRole('button', { name: 'Show 5 hidden people' }),
  ).toHaveTextContent('5 more');

  const stateful = within(
    canvas.getByRole('group', { name: 'Stateful avatars' }),
  );
  const ada = stateful.getByRole('button', { name: 'Ada activations 0' });
  await userEvent.click(ada);
  await waitFor(() => expect(ada).toHaveAccessibleName('Ada activations 1'));
  await userEvent.click(
    canvas.getByRole('button', { name: 'Reorder avatars' }),
  );
  await waitFor(() => {
    expect(stateful.getAllByRole('button')[0]).toHaveAccessibleName(
      'Bea activations 0',
    );
    expect(stateful.getByRole('button', { name: 'Ada activations 1' })).toBe(
      ada,
    );
  });
  await userEvent.click(
    canvas.getByRole('button', { name: 'Show two avatars' }),
  );
  await waitFor(() => {
    expect(stateful.getAllByRole('button')).toHaveLength(2);
    expect(stateful.getByText('+2')).toBeVisible();
  });
  await userEvent.click(canvas.getByRole('button', { name: 'Load total' }));
  await waitFor(() => expect(stateful.getByText('+18')).toBeVisible());
  await userEvent.click(
    canvas.getByRole('button', { name: 'Show four avatars' }),
  );
  await waitFor(() => {
    expect(stateful.getAllByRole('button')).toHaveLength(4);
    expect(stateful.getByText('+16')).toBeVisible();
    expect(stateful.getByRole('button', { name: 'Ada activations 1' })).toBe(
      ada,
    );
  });
  await userEvent.click(ada);
  await waitFor(() => expect(ada).toHaveAccessibleName('Ada activations 2'));

  const nativeRoot = canvas.getByRole('group', { name: 'Native root' });
  expect(nativeRoot.tagName).toBe('DIV');
  expect(nativeRoot).toHaveAttribute('id', 'native-avatar-group');
  expect(nativeRoot).toHaveAttribute('title', 'Native group title');
  expect(nativeRoot).toHaveClass('custom-avatar-group');
  expect(nativeRoot).toHaveStyle({ padding: '7px' });
  await waitFor(() =>
    expect(nativeRoot).toHaveAttribute('data-ref-tag', 'HTML-DIV'),
  );
  await userEvent.click(nativeRoot);
  await waitFor(() =>
    expect(canvas.getByLabelText('Native root activations')).toHaveTextContent(
      '1',
    ),
  );

  const button = canvas.getByRole('button', { name: 'Open avatar group' });
  expect(button).toHaveAttribute('data-composed', 'button');
  await waitFor(() =>
    expect(button).toHaveAttribute('data-ref-tag', 'HTML-BUTTON'),
  );
  await userEvent.click(button);
  await userEvent.keyboard('{Enter} ');
  await waitFor(() =>
    expect(
      canvas.getByLabelText('Composed button activations'),
    ).toHaveTextContent('3'),
  );
  expect(button).toHaveFocus();

  const link = canvas.getByRole('link', { name: 'Avatar group documentation' });
  expect(link).toHaveAttribute('href', 'https://twenty.com');
  expect(link).toHaveAttribute('target', '_blank');
  expect(link).toHaveAttribute('data-composed', 'link');
  await waitFor(() => expect(link).toHaveAttribute('data-ref-tag', 'HTML-A'));
  await userEvent.click(link);
  await userEvent.keyboard('{Enter}');
  await waitFor(() =>
    expect(
      canvas.getByLabelText('Composed link activations'),
    ).toHaveTextContent('2'),
  );
  expect(link).toHaveFocus();
  expect(errorHandler).not.toHaveBeenCalled();
};
