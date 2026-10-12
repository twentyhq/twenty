import { expect, userEvent, waitFor, within } from 'storybook/test';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { errorHandler } from '@/__stories__/shared/test-utils/createFrontComponentStoryMeta';
import { expectFrontComponentMounted } from '@/__stories__/shared/test-utils/matchers/expectFrontComponentMounted';
import { type TwentyUiGalleryPlayFunction } from '@/__stories__/twenty-ui-gallery/types/TwentyUiGalleryPlayFunction';

type Canvas = ReturnType<typeof within>;

type OverflowingListPopupScenario = {
  canvasElement: HTMLElement;
  canvas: Canvas;
  page: Canvas;
  targetsTrigger: HTMLElement;
  reviewersTrigger: HTMLElement;
};

type OpenTargetsPopupScenario = OverflowingListPopupScenario & {
  targetsPopup: HTMLElement;
};

const TARGETS_POPUP_NAME = 'Show hidden targets';
const REVIEWERS_POPUP_NAME = 'Show hidden reviewers';
const OVERFLOW_TARGET_NAMES = ['Charlie', 'Delta'];

const expectCollapsedListsShowHiddenItemCounts = async ({
  canvas,
  targetsTrigger,
  reviewersTrigger,
}: OverflowingListPopupScenario) => {
  await waitFor(() => expect(targetsTrigger).toHaveTextContent('+2'));
  await expect(reviewersTrigger).toHaveTextContent('+1');
  await expect(canvas.queryByRole('button', { name: 'Delta' })).toBeNull();
};

const openTargetsPopupWithEnterKey = async ({
  page,
  targetsTrigger,
}: OverflowingListPopupScenario): Promise<HTMLElement> => {
  targetsTrigger.focus();
  await userEvent.keyboard('{Enter}');

  return page.findByRole('dialog', { name: TARGETS_POPUP_NAME });
};

const expectTargetsPopupInsideLightThemePortalScope = async ({
  canvasElement,
  targetsTrigger,
  targetsPopup,
}: OpenTargetsPopupScenario) => {
  const portalScope = targetsTrigger.closest<HTMLDivElement>('.light');
  await expect(canvasElement).toContainElement(portalScope);
  await expect(portalScope).toContainElement(targetsPopup);
  await waitFor(() =>
    expect(getComputedStyle(targetsPopup).color).toBe(
      THEME_LIGHT.font.color.primary,
    ),
  );
};

const expectTargetsPopupListsOverflowTargets = async ({
  reviewersTrigger,
  targetsPopup,
  targetsTrigger,
}: OpenTargetsPopupScenario) => {
  const targets = within(targetsPopup);

  await waitFor(async () => {
    for (const targetName of OVERFLOW_TARGET_NAMES) {
      await expect(
        targets.getByRole('button', { name: targetName }),
      ).toBeVisible();
    }

    await expect(targets.queryByRole('button', { name: 'Alpha' })).toBeNull();
    await expect(targets.queryByRole('button', { name: 'Bravo' })).toBeNull();
    await expect(targetsTrigger).toHaveTextContent('+2');
    await expect(targets.getAllByRole('button')).toHaveLength(2);
  });
  await expect(reviewersTrigger).toHaveAttribute('aria-expanded', 'false');
};

const expectSelectingDeltaUpdatesSelectedTarget = async ({
  canvas,
  canvasElement,
  targetsPopup,
}: OpenTargetsPopupScenario) => {
  await userEvent.click(
    within(targetsPopup).getByRole('button', { name: 'Delta' }),
  );
  await waitFor(() =>
    expect(canvas.getByLabelText('Selected target')).toHaveTextContent('Delta'),
  );
  await expect(
    within(targetsPopup).getByLabelText('Delta activations'),
  ).toHaveTextContent('1');
  const deltaButton = within(targetsPopup).getByRole('button', {
    name: 'Delta',
  });
  const descriptionId = deltaButton.getAttribute('aria-describedby');
  await expect(
    within(targetsPopup).getByLabelText('Delta activations'),
  ).toHaveAttribute('id', descriptionId);
  const matchingButtons = canvasElement.ownerDocument.querySelectorAll(
    `[id="${deltaButton.id}"]`,
  );
  await expect(matchingButtons).toHaveLength(1);
};

const expectEscapeClosesPopupAndRestoresTriggerFocus = async ({
  popup,
  trigger,
}: {
  popup: HTMLElement;
  trigger: HTMLElement;
}) => {
  await userEvent.keyboard('{Escape}');
  await waitFor(() => expect(popup).not.toBeVisible());
  await waitFor(() => expect(trigger).toHaveFocus());
};

const expectSpaceReopensTargetsPopupAndOutsideClickClosesIt = async ({
  canvas,
  page,
}: OverflowingListPopupScenario) => {
  await userEvent.keyboard(' ');
  await page.findByRole('dialog', { name: TARGETS_POPUP_NAME });
  await userEvent.click(canvas.getByRole('button', { name: 'Outside list' }));
  await waitFor(() =>
    expect(page.queryByRole('dialog', { name: TARGETS_POPUP_NAME })).toBeNull(),
  );
};

const expectAddedTargetAppearsInTargetsPopup = async ({
  canvas,
  page,
  targetsTrigger,
}: OverflowingListPopupScenario) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Add target' }));
  await waitFor(() => expect(targetsTrigger).toHaveTextContent('+3'));
  await userEvent.click(targetsTrigger);
  const updatedTargetsPopup = await page.findByRole('dialog', {
    name: TARGETS_POPUP_NAME,
  });
  await waitFor(() =>
    expect(
      within(updatedTargetsPopup).getByRole('button', { name: 'Echo' }),
    ).toBeVisible(),
  );
  await expect(within(updatedTargetsPopup).getAllByRole('button')).toHaveLength(
    3,
  );
  await expect(
    within(updatedTargetsPopup).getByLabelText('Delta activations'),
  ).toHaveTextContent('1');
  await expectEscapeClosesPopupAndRestoresTriggerFocus({
    popup: updatedTargetsPopup,
    trigger: targetsTrigger,
  });
};

const openReviewersPopupWhileTargetsPopupStaysClosed = async ({
  page,
  targetsTrigger,
  reviewersTrigger,
}: OverflowingListPopupScenario): Promise<HTMLElement> => {
  await userEvent.click(reviewersTrigger);
  const reviewersPopup = await page.findByRole('dialog', {
    name: REVIEWERS_POPUP_NAME,
  });
  await waitFor(() =>
    expect(
      within(reviewersPopup).getByRole('button', { name: 'Taylor' }),
    ).toBeVisible(),
  );
  await expect(targetsTrigger).toHaveAttribute('aria-expanded', 'false');

  return reviewersPopup;
};

export const overflowingListPopupTest: TwentyUiGalleryPlayFunction = async ({
  canvasElement,
}) => {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  await expectFrontComponentMounted(canvas);

  const targetsTrigger = await canvas.findByRole('button', {
    name: /Show hidden targets$/,
  });
  const reviewersTrigger = canvas.getByRole('button', {
    name: /Show hidden reviewers$/,
  });
  const scenario: OverflowingListPopupScenario = {
    canvasElement,
    canvas,
    page,
    targetsTrigger,
    reviewersTrigger,
  };

  await expectCollapsedListsShowHiddenItemCounts(scenario);

  const targetsPopup = await openTargetsPopupWithEnterKey(scenario);
  await expectTargetsPopupInsideLightThemePortalScope({
    ...scenario,
    targetsPopup,
  });
  await expectTargetsPopupListsOverflowTargets({ ...scenario, targetsPopup });
  await expectSelectingDeltaUpdatesSelectedTarget({
    ...scenario,
    targetsPopup,
  });
  await expectEscapeClosesPopupAndRestoresTriggerFocus({
    popup: targetsPopup,
    trigger: targetsTrigger,
  });

  await expectSpaceReopensTargetsPopupAndOutsideClickClosesIt(scenario);
  await expectAddedTargetAppearsInTargetsPopup(scenario);

  const reviewersPopup =
    await openReviewersPopupWhileTargetsPopupStaysClosed(scenario);
  await expectEscapeClosesPopupAndRestoresTriggerFocus({
    popup: reviewersPopup,
    trigger: reviewersTrigger,
  });

  expect(errorHandler).not.toHaveBeenCalled();
};
