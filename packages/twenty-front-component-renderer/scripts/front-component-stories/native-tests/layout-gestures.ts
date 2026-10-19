import { expect, type Locator, type Page, test } from 'playwright/test';
import { MOUNT_TIMEOUT } from '../../../src/__stories__/shared/test-utils/timeouts';
import { readBounds } from './readBounds';

const BASE_UI_HIDDEN_EDGE_THUMB_ISSUE =
  'Base UI 1.8 and 1.9 keep edge-aligned Slider thumbs hidden in React front components (mui/base-ui#5995)';

const markReactSliderAsKnownBaseUiFailure = (runtime: string) => {
  test.fail(runtime === 'react', BASE_UI_HIDDEN_EDGE_THUMB_ISSUE);
};

const openFixture = async ({ page, story }: { page: Page; story: string }) => {
  await page.goto(
    `/iframe.html?id=frontcomponent-twenty-ui-gallery--${story}`,
    { waitUntil: 'domcontentloaded' },
  );
  await expect(page.getByTestId('front-component-mounted')).toBeVisible({
    timeout: MOUNT_TIMEOUT,
  });
};

const openVolumeSlider = async ({
  page,
  runtime,
}: {
  page: Page;
  runtime: string;
}) => {
  await openFixture({ page, story: `slider-gestures-${runtime}` });
  const slider = page.getByRole('slider', { name: 'Volume', exact: true });
  const control = page.getByTestId('volume-control');

  await expect(slider).toBeVisible();

  return { slider, control };
};

const startDrag = async ({ page, handle }: { page: Page; handle: Locator }) => {
  await handle.scrollIntoViewIfNeeded();
  const bounds = await readBounds(handle);
  const origin = {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };

  await page.mouse.move(origin.x, origin.y);
  await page.mouse.down();

  return origin;
};

const readPointerXForSliderValue = async ({
  control,
  thumb,
  value,
  min,
  max,
}: {
  control: Locator;
  thumb: Locator;
  value: number;
  min: number;
  max: number;
}) => {
  const controlBounds = await readBounds(control);
  const thumbInset = (await readBounds(thumb)).width / 2;

  return (
    controlBounds.x +
    thumbInset +
    ((value - min) / (max - min)) * (controlBounds.width - thumbInset * 2)
  );
};

for (const runtime of ['react', 'preact']) {
  test.describe(runtime, () => {
    test('ResizeHandle captures moves beyond its widget and commits only on release', async ({
      page,
    }) => {
      await openFixture({ page, story: `resize-handle-gestures-${runtime}` });
      const handle = page.getByRole('separator', { name: 'Resize edge panel' });
      const origin = await startDrag({ page, handle });

      await page.mouse.move(origin.x - 60, origin.y - 160);
      await expect(handle).toHaveAttribute('aria-valuenow', '220');
      await expect(page.getByText('Committed edge: 160')).toBeVisible();
      await expect(page.getByText('Resize result: Resizing')).toBeVisible();
      await expect
        .poll(() => handle.evaluate((element) => element.hasPointerCapture(1)))
        .toBe(true);
      await page.mouse.up();
      await expect(page.getByText('Committed edge: 220')).toBeVisible();
      await expect(page.getByText('Resize result: Finished')).toBeVisible();
      await expect(page.getByText('Collapse count: 0')).toBeVisible();
      await expect
        .poll(() => handle.evaluate((element) => element.hasPointerCapture(1)))
        .toBe(false);
      await page.mouse.move(origin.x + 100, origin.y);
      await expect(handle).toHaveAttribute('aria-valuenow', '220');
    });

    test('ResizeHandle cancels unexpected capture loss and Escape without committing', async ({
      page,
    }) => {
      await openFixture({ page, story: `resize-handle-gestures-${runtime}` });
      const handle = page.getByRole('separator', { name: 'Resize edge panel' });
      let origin = await startDrag({ page, handle });

      await page.mouse.move(origin.x + 30, origin.y);
      await expect(handle).toHaveAttribute('aria-valuenow', '130');
      await handle.evaluate((element) => element.releasePointerCapture(1));
      await page.mouse.move(origin.x + 40, origin.y);
      await expect(handle).toHaveAttribute('aria-valuenow', '160');
      await expect(page.getByText('Resize result: Cancelled')).toBeVisible();
      await page.mouse.up();
      origin = await startDrag({ page, handle });
      await page.mouse.move(origin.x - 30, origin.y);
      await expect(handle).toHaveAttribute('aria-valuenow', '190');
      await page.keyboard.press('Escape');
      await expect(handle).toHaveAttribute('aria-valuenow', '160');
      await page.mouse.up();
      await expect(page.getByText('Committed edge: 160')).toBeVisible();
      await expect(page.getByText('Collapse count: 0')).toBeVisible();
    });

    test('ResizeHandle respects bounds, scale, keyboard changes and click activation', async ({
      page,
    }) => {
      await openFixture({ page, story: `resize-handle-gestures-${runtime}` });
      const edge = page.getByRole('separator', { name: 'Resize edge panel' });
      let origin = await startDrag({ page, handle: edge });

      await page.mouse.move(origin.x + 200, origin.y);
      await expect(edge).toHaveAttribute('aria-valuenow', '100');
      await page.mouse.up();
      await expect(page.getByText('Committed edge: 100')).toBeVisible();
      await edge.focus();
      await page.keyboard.press('End');
      await expect(edge).toHaveAttribute('aria-valuenow', '240');
      await page.keyboard.press('ArrowLeft');
      await expect(edge).toHaveAttribute('aria-valuenow', '240');
      await page.keyboard.press('Home');
      await page.keyboard.press('ArrowLeft');
      await expect(page.getByText('Committed edge: 110')).toBeVisible();
      await page.keyboard.press('Enter');
      await expect(page.getByText('Collapse count: 1')).toBeVisible();
      const gap = page.getByRole('separator', { name: 'Resize gap panel' });

      origin = await startDrag({ page, handle: gap });
      await page.mouse.move(origin.x, origin.y - 80);
      await expect(gap).toHaveAttribute('aria-valuenow', '140');
      await expect(page.getByText('Committed gap: 100')).toBeVisible();
      await page.mouse.up();
      await expect(page.getByText('Committed gap: 140')).toBeVisible();
      await expect(page.getByText('Collapse count: 1')).toBeVisible();
    });

    for (const action of ['Disable edge resizing', 'Hide edge handle']) {
      test(`ResizeHandle cancels when ${action.toLowerCase()} during a drag`, async ({
        page,
      }) => {
        await openFixture({ page, story: `resize-handle-gestures-${runtime}` });
        const handle = page.getByRole('separator', {
          name: 'Resize edge panel',
        });
        const origin = await startDrag({ page, handle });

        await page.mouse.move(origin.x - 30, origin.y);
        await expect(handle).toHaveAttribute('aria-valuenow', '190');
        await page.getByRole('button', { name: action }).focus();
        await page.keyboard.press('Enter');
        await page.mouse.move(origin.x - 40, origin.y);
        await page.mouse.up();
        await expect(page.getByText('Committed edge: 160')).toBeVisible();
        await expect(page.getByText('Resize result: Cancelled')).toBeVisible();
        await expect(page.getByText('Edge size: 160')).toBeVisible();
        await expect(page.getByText('Collapse count: 0')).toBeVisible();
      });
    }

    test('Slider displays its thumb and supports keyboard commits and disabled controls', async ({
      page,
    }) => {
      markReactSliderAsKnownBaseUiFailure(runtime);
      const { slider } = await openVolumeSlider({ page, runtime });

      await expect(slider).toHaveAttribute('min', '10');
      await expect(slider).toHaveAttribute('max', '90');
      await expect(slider).toHaveAttribute('step', '5');
      await slider.focus();
      await page.keyboard.press('ArrowRight');
      await expect(slider).toHaveValue('45');
      await expect(page.getByText('Volume: 45; Committed: 45')).toBeVisible();
      await page.keyboard.press('Home');
      await expect(slider).toHaveValue('10');
      await page.keyboard.press('End');
      await expect(slider).toHaveValue('90');
      await expect(page.getByText('Volume: 90; Committed: 90')).toBeVisible();
      await expect(
        page.getByRole('slider', { name: 'Disabled volume' }),
      ).toBeDisabled();
    });

    test('Slider commits a quick track press released before the worker answers', async ({
      page,
    }) => {
      markReactSliderAsKnownBaseUiFailure(runtime);
      const { control } = await openVolumeSlider({ page, runtime });
      const bounds = await readBounds(control);

      await page.mouse.move(
        bounds.x + bounds.width * 0.8,
        bounds.y + bounds.height / 2,
      );
      await page.mouse.down();
      await page.mouse.up();
      const volumeStatus = page.getByText(/^Volume: \d+; Committed: \d+$/);

      await expect(volumeStatus).not.toHaveText('Volume: 40; Committed: 40');
      await expect(volumeStatus).toHaveText(/^Volume: (\d+); Committed: \1$/);
      await expect(control).not.toHaveAttribute('data-dragging');
    });

    test('Slider follows native pointer moves beyond the widget and commits the bounded final value', async ({
      page,
    }) => {
      markReactSliderAsKnownBaseUiFailure(runtime);
      const { slider, control } = await openVolumeSlider({ page, runtime });

      await page
        .getByRole('button', { name: 'Parent action', exact: true })
        .click();
      await expect(page.getByText('Parent actions: 1')).toBeVisible();
      await expect(page.getByText('Parent presses: 1')).toBeVisible();
      const origin = await startDrag({ page, handle: slider });
      await expect(control).toHaveAttribute('data-dragging', '');
      await expect
        .poll(() => control.evaluate((element) => element.hasPointerCapture(1)))
        .toBe(true);
      await expect(page.getByText('Parent presses: 2')).toBeVisible();
      const bounds = await readBounds(control);

      await page.mouse.move(bounds.x + bounds.width + 80, origin.y - 150);
      await expect(slider).toHaveValue('90');
      await expect(page.getByText('Volume: 90; Committed: 40')).toBeVisible();
      await page.mouse.up();
      await expect(page.getByText('Volume: 90; Committed: 90')).toBeVisible();
      await expect(page.getByText('Parent presses: 2')).toBeVisible();
      await expect(page.getByText('Parent actions: 1')).toBeVisible();
      await expect
        .poll(() => control.evaluate((element) => element.hasPointerCapture(1)))
        .toBe(false);
      await page.mouse.move(bounds.x - 80, origin.y);
      await expect(slider).toHaveValue('90');
    });

    test('Slider continues its native document drag and commits after unexpected capture loss', async ({
      page,
    }) => {
      markReactSliderAsKnownBaseUiFailure(runtime);
      const { slider, control } = await openVolumeSlider({ page, runtime });
      const worker = page.workers()[0];

      await worker.evaluate(() => {
        let ownedButton: HTMLButtonElement | undefined;

        document.querySelectorAll('button').forEach((button) => {
          if (button.textContent === 'Disable volume') {
            ownedButton = button;
          }
        });
        const pointerMoves: { clientX: number; clientY: number }[] = [];

        Object.assign(globalThis, { capturedPointerMoveProbe: pointerMoves });
        ownedButton!.addEventListener('pointermove', () => undefined);
        document.addEventListener('pointermove', (event) => {
          pointerMoves.push({ clientX: event.clientX, clientY: event.clientY });
        });
      });
      const origin = await startDrag({ page, handle: slider });
      await expect(control).toHaveAttribute('data-dragging', '');
      const bounds = await readBounds(control);

      await page.mouse.move(
        await readPointerXForSliderValue({
          control,
          thumb: slider.locator('..'),
          value: 70,
          min: 10,
          max: 90,
        }),
        origin.y,
      );
      await expect(slider).toHaveValue('70');
      await control.evaluate((element) => element.releasePointerCapture(1));
      const ownedButtonBounds = await readBounds(
        page.getByRole('button', { name: 'Disable volume' }),
      );
      const crossingPosition = {
        clientX: ownedButtonBounds.x + ownedButtonBounds.width / 2,
        clientY: ownedButtonBounds.y + ownedButtonBounds.height / 2,
      };

      await page.mouse.move(crossingPosition.clientX, crossingPosition.clientY);
      await expect(slider).toHaveValue('50');
      await page.mouse.move(bounds.x + bounds.width + 80, origin.y);
      await expect(slider).toHaveValue('90');
      await expect(page.getByText('Volume: 90; Committed: 40')).toBeVisible();
      await page.mouse.up();
      await expect(page.getByText('Volume: 90; Committed: 90')).toBeVisible();
      await expect(control).not.toHaveAttribute('data-dragging');
      const deliveredCrossingMoves = await worker.evaluate((position) => {
        const { capturedPointerMoveProbe } = globalThis as typeof globalThis & {
          capturedPointerMoveProbe: { clientX: number; clientY: number }[];
        };

        return capturedPointerMoveProbe.filter(
          (event) =>
            Math.abs(event.clientX - position.clientX) < 1 &&
            Math.abs(event.clientY - position.clientY) < 1,
        ).length;
      }, crossingPosition);

      expect(deliveredCrossingMoves).toBe(1);
    });

    test('Slider preserves its public Escape behavior and measures scaled pointer movement', async ({
      page,
    }) => {
      markReactSliderAsKnownBaseUiFailure(runtime);
      await openFixture({ page, story: `slider-gestures-${runtime}` });
      await page.getByRole('button', { name: 'Scale volume' }).click();
      const slider = page.getByRole('slider', { name: 'Volume', exact: true });
      const control = page.getByTestId('volume-control');

      await expect(slider).toBeVisible();
      const origin = await startDrag({ page, handle: slider });
      await expect(control).toHaveAttribute('data-dragging', '');
      const bounds = await readBounds(control);

      await page.mouse.move(bounds.x + bounds.width / 2, origin.y);
      await expect(slider).toHaveValue('50');
      await page.keyboard.press('Escape');
      await expect(slider).toHaveValue('50');
      await expect(page.getByText('Volume: 50; Committed: 40')).toBeVisible();
      await page.mouse.up();
      await expect(page.getByText('Volume: 50; Committed: 50')).toBeVisible();
    });

    for (const action of ['Disable volume', 'Hide volume']) {
      test(`Slider stops an active drag when ${action.toLowerCase()}`, async ({
        page,
      }) => {
        markReactSliderAsKnownBaseUiFailure(runtime);
        const { slider, control } = await openVolumeSlider({ page, runtime });
        const origin = await startDrag({ page, handle: slider });
        await expect(control).toHaveAttribute('data-dragging', '');
        const bounds = await readBounds(control);

        await page.mouse.move(bounds.x + bounds.width + 60, origin.y);
        await expect(page.getByText('Volume: 90; Committed: 40')).toBeVisible();
        await page.getByRole('button', { name: action }).focus();
        await page.keyboard.press('Enter');
        await page.mouse.move(bounds.x - 60, origin.y);
        await page.mouse.up();
        await expect(page.getByText('Volume: 90; Committed: 40')).toBeVisible();
        await expect(page.getByText(/FrontComponent error/)).toHaveCount(0);
      });
    }

    test('Slider range changes and commits the active public thumb without moving its neighbor', async ({
      page,
    }) => {
      markReactSliderAsKnownBaseUiFailure(runtime);
      await openFixture({ page, story: `slider-range-gestures-${runtime}` });
      const minimum = page.getByRole('slider', { name: 'Minimum price' });
      const maximum = page.getByRole('slider', { name: 'Maximum price' });

      await expect(minimum).toBeVisible();
      await expect(maximum).toBeVisible();
      await minimum.focus();
      await page.keyboard.press('ArrowRight');
      await expect(minimum).toHaveValue('21');
      await expect(maximum).toHaveValue('80');
      await expect(
        page.getByText('Range: 21, 80; Committed range: 21, 80'),
      ).toBeVisible();
      const origin = await startDrag({ page, handle: maximum });
      await expect(page.getByTestId('range-control')).toHaveAttribute(
        'data-dragging',
        '',
      );
      const bounds = await readBounds(page.getByTestId('range-control'));

      await page.mouse.move(bounds.x + bounds.width + 80, origin.y);
      await expect(maximum).toHaveValue('100');
      await expect(minimum).toHaveValue('21');
      await expect(
        page.getByText('Range: 21, 100; Committed range: 21, 80'),
      ).toBeVisible();
      await page.mouse.up();
      await expect(
        page.getByText('Range: 21, 100; Committed range: 21, 100'),
      ).toBeVisible();
    });
  });
}
