import { expect, userEvent, waitFor, within } from 'storybook/test';
import { isDefined } from 'twenty-shared/utils';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { TYPING_DELAY } from '@/__stories__/shared/test-utils/timeouts';
import { AVATAR_IMAGE_FIXTURE } from '@/__stories__/twenty-ui-gallery/constants/AVATAR_IMAGE_FIXTURE';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { observeAvatarImageLoads } from '@/__stories__/twenty-ui-gallery/utils/observeAvatarImageLoads';

const IS_BROWSER_TEST =
  (import.meta as ImportMeta & { env: { MODE: string } }).env.MODE === 'test';

const expectLoadedAvatar = async ({
  avatar,
  source,
  width,
}: {
  avatar: HTMLElement;
  source: string;
  width: number;
}) => {
  await waitFor(() => {
    const image = within(avatar).getByRole('presentation');

    expect(avatar.style.getPropertyValue('--avatar-image-status')).toBe(
      'loaded',
    );
    expect(image).toHaveAttribute('src', source);
    expect(image).toHaveProperty('naturalWidth', width);
    expect(image).toBeVisible();
    expect(within(avatar).queryByText('I')).not.toBeInTheDocument();
  });
};

export const avatarImageTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);

  const avatar = canvas.getByRole('button', { name: 'Profile avatar' });
  const activations = canvas.getByLabelText('Avatar activations');
  const pendingSources: string[] = [];
  const imageLoads = IS_BROWSER_TEST ? observeAvatarImageLoads() : undefined;

  const releasePendingImage = async (source: string) => {
    const response = await fetch(`${source}/release`, { method: 'POST' });

    expect(response.ok).toBe(true);
    await waitFor(() => expect(imageLoads?.hasLoaded(source)).toBe(true));
  };

  const startPendingImage = async () => {
    const requestId = Math.random().toString(36).slice(2);
    const source = `${AVATAR_IMAGE_FIXTURE.requestPath}${requestId}.svg`;
    const sourceInput = canvas.getByRole('textbox', {
      name: 'Avatar image source',
    });

    await userEvent.clear(sourceInput);
    await userEvent.type(sourceInput, source, { delay: TYPING_DELAY });
    await waitFor(() => expect(sourceInput).toHaveValue(source));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Apply avatar source' }),
    );
    await waitFor(() =>
      expect(avatar.style.getPropertyValue('--avatar-image-status')).toBe(
        'loading',
      ),
    );
    pendingSources.push(source);
    await waitFor(async () => {
      const response = await fetch(`${source}/status`);
      const requestStatus: { pending: number } = await response.json();

      expect(requestStatus.pending).toBeGreaterThan(0);
    });
    await expect(within(avatar).getByText('I')).toBeVisible();

    return source;
  };

  try {
    await expectLoadedAvatar({
      avatar,
      source: AVATAR_IMAGE_FIXTURE.firstSource,
      width: 40,
    });
    await userEvent.click(avatar);
    await waitFor(() => expect(activations).toHaveTextContent('1'));
    await userEvent.click(
      canvas.getByRole('button', { name: 'Replace avatar image' }),
    );
    await expectLoadedAvatar({
      avatar,
      source: AVATAR_IMAGE_FIXTURE.replacementSource,
      width: 64,
    });

    const replacedSource = IS_BROWSER_TEST
      ? await startPendingImage()
      : undefined;

    await userEvent.click(
      canvas.getByRole('button', { name: 'Break avatar image' }),
    );
    await waitFor(() => {
      expect(avatar.style.getPropertyValue('--avatar-image-status')).toBe(
        'error',
      );
      expect(
        within(avatar).queryByRole('presentation'),
      ).not.toBeInTheDocument();
      expect(within(avatar).getByText('I')).toBeVisible();
    });
    if (isDefined(replacedSource)) {
      await releasePendingImage(replacedSource);
    }
    await userEvent.click(avatar);
    await waitFor(() => expect(activations).toHaveTextContent('2'));
    await expect(avatar.style.getPropertyValue('--avatar-image-status')).toBe(
      'error',
    );
    await expect(within(avatar).getByText('I')).toBeVisible();
    await expect(
      within(avatar).queryByRole('presentation'),
    ).not.toBeInTheDocument();

    const unmountedSource = IS_BROWSER_TEST
      ? await startPendingImage()
      : undefined;

    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove avatar' }),
    );
    await waitFor(() =>
      expect(
        canvas.queryByRole('button', { name: 'Profile avatar' }),
      ).not.toBeInTheDocument(),
    );
    if (isDefined(unmountedSource)) {
      await releasePendingImage(unmountedSource);
    }
    await userEvent.click(
      canvas.getByRole('button', { name: 'Restore avatar image' }),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Mount avatar' }));
    const remountedAvatar = await canvas.findByRole('button', {
      name: 'Profile avatar',
    });

    await expectLoadedAvatar({
      avatar: remountedAvatar,
      source: AVATAR_IMAGE_FIXTURE.firstSource,
      width: 40,
    });
    await userEvent.click(remountedAvatar);
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(activations).toHaveTextContent('4'));
    await expect(errorHandler).not.toHaveBeenCalled();
  } finally {
    imageLoads?.restore();
    for (const source of pendingSources) {
      await fetch(`${source}/release`, { method: 'POST' });
    }
  }
};
