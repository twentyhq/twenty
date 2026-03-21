import { type Locator, type Page } from '@playwright/test';

export class PageLayoutWidgets {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // Wait for the page layout to finish initialising.
  // PageLayoutRendererContent gates on pageLayoutIsInitialized before rendering
  // PageLayoutTabsRenderer, so we wait for at least one widget card to appear.
  async waitForLoad() {
    await this.page
      .locator('.widget')
      .first()
      .waitFor({ state: 'visible', timeout: 15_000 });
  }

  // Return the widget card element whose header title matches the given string.
  // WidgetRenderer renders each card with className="widget" and the title is
  // rendered as text inside WidgetCardHeader.
  getWidgetByTitle(title: string): Locator {
    return this.page.locator('.widget', { hasText: title });
  }

  // Return a field row within the fields widget by its label text.
  // Excludes tooltip elements (which duplicate the label text but are always
  // present in the DOM regardless of field visibility).
  getFieldByLabel(label: string): Locator {
    return this.page
      .getByText(label, { exact: true })
      .and(this.page.locator(':not([data-testid="tooltip"])'));
  }

  // Return the titles of all currently visible widget cards.
  async getVisibleWidgetTitles(): Promise<string[]> {
    const headers = this.page.locator('.widget [class*="StyledTitleContainer"]');
    return headers.allTextContents();
  }
}
