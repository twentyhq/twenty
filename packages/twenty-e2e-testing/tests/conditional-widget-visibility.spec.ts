import { expect, test } from '../lib/fixtures/screenshot';
import { PageLayoutWidgets } from '../lib/pom/pageLayoutWidgets';
import {
  createOpportunity,
  deleteOpportunity,
  updateOpportunity,
} from '../lib/requests/opportunity';

test('Conditional field visibility — Loss fields shown only when stage is CLOSEDLOST', async ({
  page,
}) => {
  const opportunityId = await createOpportunity({
    page,
    fields: { stage: 'NEW' },
  });

  try {
    // -----------------------------------------------------------------------
    // 1. Loss fields are hidden when stage is NEW
    // -----------------------------------------------------------------------
    await page.goto(`/object/opportunity/${opportunityId}`);
    const widgets = new PageLayoutWidgets(page);
    await widgets.waitForLoad();

    await expect(widgets.getFieldByLabel('Loss notes')).not.toBeVisible();
    await expect(widgets.getFieldByLabel('Loss Reason')).not.toBeVisible();

    // -----------------------------------------------------------------------
    // 2. Loss fields appear when stage is updated to CLOSEDLOST
    // -----------------------------------------------------------------------
    await updateOpportunity({
      page,
      id: opportunityId,
      fields: { stage: 'CLOSEDLOST' },
    });

    await page.goto(`/object/opportunity/${opportunityId}`);
    await widgets.waitForLoad();

    await expect(widgets.getFieldByLabel('Loss notes')).toBeVisible();
    await expect(widgets.getFieldByLabel('Loss Reason')).toBeVisible();

    // -----------------------------------------------------------------------
    // 3. Loss fields are hidden again when stage returns to NEW
    // -----------------------------------------------------------------------
    await updateOpportunity({
      page,
      id: opportunityId,
      fields: { stage: 'NEW' },
    });

    await page.goto(`/object/opportunity/${opportunityId}`);
    await widgets.waitForLoad();

    await expect(widgets.getFieldByLabel('Loss notes')).not.toBeVisible();
    await expect(widgets.getFieldByLabel('Loss Reason')).not.toBeVisible();

    // -----------------------------------------------------------------------
    // 4. Tab bar renders at least one tab regardless of stage
    // -----------------------------------------------------------------------
    await expect(page.getByRole('link', { name: 'Timeline' })).toBeVisible();
  } finally {
    await deleteOpportunity({ page, id: opportunityId });
  }
});
