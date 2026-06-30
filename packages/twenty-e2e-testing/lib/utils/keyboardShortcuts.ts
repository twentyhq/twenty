import { Page } from '@playwright/test';

const MAC = process.platform === 'darwin';

async function keyDownCtrlOrMeta(page: Page) {
  if (MAC) {
    await page.keyboard.down('Meta');
  } else {
    await page.keyboard.down('Control');
  }
}

async function keyUpCtrlOrMeta(page: Page) {
  if (MAC) {
    await page.keyboard.up('Meta');
  } else {
    await page.keyboard.up('Control');
  }
}

export async function withCtrlOrMeta(page: Page, key: () => Promise<void>) {
  await keyDownCtrlOrMeta(page);
  await key();
  await keyUpCtrlOrMeta(page);
}

export async function selectAllByKeyboard(page: Page) {
  await keyDownCtrlOrMeta(page);
  await page.keyboard.press('a', { delay: 50 });
  await keyUpCtrlOrMeta(page);
}

export async function copyByKeyboard(page: Page) {
  await keyDownCtrlOrMeta(page);
  await page.keyboard.press('c', { delay: 50 });
  await keyUpCtrlOrMeta(page);
}

export async function cutByKeyboard(page: Page) {
  await keyDownCtrlOrMeta(page);
  await page.keyboard.press('x', { delay: 50 });
  await keyUpCtrlOrMeta(page);
}

export async function pasteByKeyboard(page: Page) {
  await keyDownCtrlOrMeta(page);
  await page.keyboard.press('v', { delay: 50 });
  await keyUpCtrlOrMeta(page);
}

export async function companiesShortcut(page: Page) {
  await page.keyboard.press('g', { delay: 50 });
  await page.keyboard.press('c');
}

export async function notesShortcut(page: Page) {
  await page.keyboard.press('g', { delay: 50 });
  await page.keyboard.press('n');
}

export async function opportunitiesShortcut(page: Page) {
  await page.keyboard.press('g', { delay: 50 });
  await page.keyboard.press('o');
}

export async function peopleShortcut(page: Page) {
  await page.keyboard.press('g', { delay: 50 });
  await page.keyboard.press('p');
}

export async function rocketsShortcut(page: Page) {
  await page.keyboard.press('g', { delay: 50 });
  await page.keyboard.press('r');
}

export async function tasksShortcut(page: Page) {
  await page.keyboard.press('g', { delay: 50 });
  await page.keyboard.press('t');
}

export async function workflowsShortcut(page: Page) {
  await page.keyboard.press('g', { delay: 50 });
  await page.keyboard.press('w');
}

export async function settingsShortcut(page: Page) {
  await page.keyboard.press('g', { delay: 50 });
  await page.keyboard.press('s');
}

export async function customShortcut(page: Page, shortcut: string) {
  await page.keyboard.press('g', { delay: 50 });
  await page.keyboard.press(shortcut);
}
