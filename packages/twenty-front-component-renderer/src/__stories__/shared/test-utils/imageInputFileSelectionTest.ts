import { type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';

type ImageInputFileSelectionPlayFunction = NonNullable<
  StoryObj<typeof FrontComponentRenderer>['play']
>;

export const imageInputFileSelectionTest: ImageInputFileSelectionPlayFunction =
  async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const rendererName of ['Primary renderer', 'Secondary renderer']) {
      const renderer = within(
        canvas.getByRole('region', { name: rendererName }),
      );

      await expectFrontComponentMounted(renderer);

      const imageInput = renderer.getByRole('group', {
        name: 'Profile image',
      });
      const imageInputControls = within(imageInput);
      const chooseButtons = imageInputControls.getAllByRole('button', {
        name: 'Choose profile image',
      });
      const fileInput = imageInput.querySelector('input[type="file"]');

      expect(imageInput).toBeVisible();
      expect(chooseButtons).toHaveLength(2);
      for (const button of chooseButtons) {
        expect(button).toBeEnabled();
      }
      expect(fileInput).toBeInstanceOf(HTMLInputElement);
      expect(fileInput).toHaveAttribute('accept', 'image/*');
      expect(fileInput).not.toBeVisible();
    }

    expect(errorHandler).not.toHaveBeenCalled();
  };
