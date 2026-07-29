import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = '/home/user/shots/openrecord';
mkdirSync(OUT, { recursive: true });

const W = Number(process.env.W ?? 390);
const H = Number(process.env.H ?? 844);
const TAG = process.env.TAG ?? 'mobile';

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
  args: ['--no-sandbox'],
});
const context = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 2,
  isMobile: W < 800,
  hasTouch: W < 800,
});
const page = await context.newPage();

const state = async (label) => {
  const panelOpen =
    (await page.locator('[aria-label="Close side panel"]').count()) > 0;
  console.log(`${label} | url=${page.url()} | sidePanelOpen=${panelOpen}`);
};

await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
const cont = page.locator('button:has-text("Continue")').first();
await cont.waitFor({ state: 'visible', timeout: 90000 });
await cont.click();
const signIn = page.locator('button:has-text("Sign in")').first();
await signIn.waitFor({ state: 'visible', timeout: 90000 });
await signIn.click();
await page.waitForURL(/objects/, { timeout: 90000 });
await page.waitForTimeout(9000);

// Search side panel -> tap a result. This is one of the thirteen call sites
// that never went through useResolveOpenRecordIn.
await page.locator('button[aria-label="Search"]').click();
await page.waitForTimeout(2500);
await state('search panel opened');
await page.screenshot({ path: `${OUT}/${TAG}-1-search.png` });

const firstResult = page.locator('text=· Person').first();
if (await firstResult.count()) {
  await firstResult.click();
  await page.waitForTimeout(5000);
  await state('after tapping a search result');
  await page.screenshot({ path: `${OUT}/${TAG}-2-after-result.png` });
} else {
  console.log('no search result found');
}

await browser.close();
