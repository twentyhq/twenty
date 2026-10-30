import { expect, test } from 'playwright/test';

for (const runtime of ['react', 'preact']) {
  test(`${runtime} measures initial and responsive OverflowingLists across independent renderer instances`, async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=frontcomponent-twenty-ui-gallery--overflowing-list-instances-${runtime}`,
    );
    const first = page.getByRole('group', { name: 'First renderer' });
    const second = page.getByRole('group', { name: 'Second renderer' });
    const firstTrigger = first.getByRole('button', {
      name: /Show all measured items$/,
    });
    const secondTrigger = second.getByRole('button', {
      name: /Show all measured items$/,
    });

    await expect(first.getByTestId('front-component-mounted')).toBeVisible({
      timeout: 30000,
    });
    await expect(second.getByTestId('front-component-mounted')).toBeVisible({
      timeout: 30000,
    });
    await expect(firstTrigger).toHaveText('+2');
    await expect(secondTrigger).toHaveText('+2');
    await expect(
      first.getByRole('button', { name: 'Measured Alpha' }),
    ).toBeVisible();
    await expect(
      first.getByRole('button', { name: 'Measured Delta' }),
    ).toHaveCount(0);
    await expect(
      second.getByRole('button', { name: 'Measured Alpha' }),
    ).toBeVisible();

    await first.getByRole('button', { name: 'Widen measured list' }).click();
    await expect(firstTrigger).toHaveCount(0);
    await expect(
      first.getByRole('button', { name: 'Measured Delta' }),
    ).toBeVisible();
    await expect(secondTrigger).toHaveText('+2');
    await expect(
      second.getByRole('button', { name: 'Measured Delta' }),
    ).toHaveCount(0);

    await first.getByRole('button', { name: 'Narrow measured list' }).click();
    await expect(firstTrigger).toHaveText('+1');
    await expect(
      first.getByRole('button', { name: 'Measured Bravo' }),
    ).toBeVisible();
    await expect(
      first.getByRole('button', { name: 'Measured Delta' }),
    ).toHaveCount(0);
    await expect(secondTrigger).toHaveText('+2');

    await page.getByRole('button', { name: 'Remove first renderer' }).click();
    await expect(first.getByTestId('front-component-mounted')).toHaveCount(0);
    await second.getByRole('button', { name: 'Widen measured list' }).click();
    await expect(secondTrigger).toHaveCount(0);
    await expect(
      second.getByRole('button', { name: 'Measured Delta' }),
    ).toBeVisible();
    await second.getByRole('button', { name: 'Narrow measured list' }).click();
    await expect(secondTrigger).toHaveText('+1');
    await expect(
      second.getByRole('button', { name: 'Measured Bravo' }),
    ).toBeVisible();

    await second.getByRole('button', { name: 'Remove measured list' }).click();
    await expect(
      second.getByRole('button', { name: 'Measured Alpha' }),
    ).toHaveCount(0);
    await second.getByRole('button', { name: 'Add target' }).click();
    await expect(
      second.getByRole('button', { name: /Show all targets$/ }),
    ).toHaveText('+3');
  });
}
