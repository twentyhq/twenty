import { expect, fireEvent, userEvent, waitFor, within } from 'storybook/test';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';
import { withMockPointerCapture } from '@/__stories__/twenty-ui-gallery/utils/withMockPointerCapture';

export const resizablePanelTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  await expectFrontComponentMounted(canvas);
  const edge = canvas.getByRole('separator', { name: 'Resize edge panel' });
  const gap = canvas.getByRole('separator', { name: 'Resize gap panel' });

  await withMockPointerCapture({
    handles: [edge, gap],
    run: async () => {
      edge.focus();
      await expect(edge).toHaveFocus();
      await userEvent.keyboard('{ArrowLeft}');
      await waitFor(() => {
        expect(edge).toHaveAttribute('aria-valuenow', '170');
        expect(canvas.getByText('Committed edge: 170')).toBeVisible();
      });
      await userEvent.keyboard('{Home}');
      await waitFor(() => expect(edge).toHaveAttribute('aria-valuenow', '100'));
      await userEvent.keyboard('{End}');
      await waitFor(() => expect(edge).toHaveAttribute('aria-valuenow', '240'));
      await userEvent.keyboard('{Enter}');
      await expect(await canvas.findByText('Collapse count: 1')).toBeVisible();

      await fireEvent.pointerDown(edge, {
        pointerId: 1,
        button: 0,
        clientX: 100,
      });
      await fireEvent.pointerMove(edge, { pointerId: 1, clientX: 130 });
      await waitFor(() => {
        expect(edge).toHaveAttribute('aria-valuenow', '210');
        expect(canvas.getByText('Edge size: 210')).toBeVisible();
        expect(canvas.getByText('Resize result: Resizing')).toBeVisible();
        expect(canvas.getByText('Committed edge: 240')).toBeVisible();
        expect(gap).toHaveAttribute('aria-valuenow', '100');
      });
      await fireEvent.pointerUp(edge, { pointerId: 1, clientX: 130 });
      await expect(
        await canvas.findByText('Resize result: Finished'),
      ).toBeVisible();
      await fireEvent.click(edge, { detail: 1 });
      await expect(await canvas.findByText('Edge clicks: 1')).toBeVisible();
      await waitFor(() => {
        expect(canvas.getByText('Committed edge: 210')).toBeVisible();
        expect(canvas.getByText('Resize result: Finished')).toBeVisible();
        expect(canvas.getByText('Collapse count: 1')).toBeVisible();
      });

      await fireEvent.pointerDown(edge, {
        pointerId: 2,
        button: 0,
        clientX: 100,
      });
      await fireEvent.pointerMove(edge, { pointerId: 2, clientX: 500 });
      await waitFor(() => expect(edge).toHaveAttribute('aria-valuenow', '100'));
      await fireEvent.pointerCancel(edge, { pointerId: 2 });
      await waitFor(() => {
        expect(edge).toHaveAttribute('aria-valuenow', '210');
        expect(canvas.getByText('Committed edge: 210')).toBeVisible();
        expect(canvas.getByText('Resize result: Cancelled')).toBeVisible();
      });
      await fireEvent.pointerMove(edge, { pointerId: 2, clientX: 600 });
      await expect(edge).toHaveAttribute('aria-valuenow', '210');
      await fireEvent.click(edge, { detail: 0 });
      await expect(await canvas.findByText('Collapse count: 2')).toBeVisible();

      await fireEvent.pointerDown(edge, {
        pointerId: 3,
        button: 0,
        clientX: 100,
      });
      await fireEvent.pointerUp(edge, { pointerId: 3, clientX: 100 });
      await fireEvent.click(edge, { detail: 1 });
      await expect(await canvas.findByText('Collapse count: 3')).toBeVisible();

      await userEvent.click(gap);
      await expect(gap).toHaveFocus();
      await userEvent.keyboard('{ArrowUp}');
      await waitFor(() => {
        expect(gap).toHaveAttribute('aria-valuenow', '110');
        expect(canvas.getByText('Committed gap: 110')).toBeVisible();
      });
      await fireEvent.pointerDown(gap, {
        pointerId: 4,
        button: 0,
        clientY: 100,
      });
      await fireEvent.pointerMove(gap, { pointerId: 4, clientY: 60 });
      await waitFor(() => {
        expect(gap).toHaveAttribute('aria-valuenow', '130');
        expect(canvas.getByText('Committed gap: 110')).toBeVisible();
        expect(edge).toHaveAttribute('aria-valuenow', '210');
      });
      await fireEvent.pointerUp(gap, { pointerId: 4, clientY: 60 });
      await expect(await canvas.findByText('Committed gap: 130')).toBeVisible();
      await expect(errorHandler).not.toHaveBeenCalled();
    },
  });
};
