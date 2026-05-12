/**
 * Converts existing User Guide illustrations into halftone style.
 * Uses Playwright to run a canvas-based halftone filter in the browser.
 * No dev server needed.
 *
 * Usage:
 *   node packages/twenty-docs/scripts/generate-halftone-illustrations.mjs
 */

import { chromium } from 'playwright';
import { writeFileSync, readFileSync, mkdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS_IMAGES = join(__dirname, '..', 'images');
const OUTPUT_DIR = join(DOCS_IMAGES, 'user-guide', 'halftone');

const ILLUSTRATIONS = [
  { name: 'data-model', source: 'user-guide/fields/custom_data_model.png' },
  { name: 'data-migration', source: 'user-guide/import-export-data/cloud.png' },
  { name: 'calendar-emails', source: 'user-guide/emails/emails_header.png' },
  { name: 'workflows', source: 'user-guide/workflows/workflow.png' },
  { name: 'ai', source: 'user-guide/workflows/robot.png' },
  { name: 'layout', source: 'user-guide/table-views/table_pink.png' },
  { name: 'dashboards', source: 'user-guide/reporting/pie-chart.png' },
  { name: 'permissions', source: 'user-guide/permissions/permissions.png' },
  { name: 'billing', source: 'user-guide/setup/pricing.png' },
  { name: 'settings', source: 'user-guide/setup/settings.png' },
  // Developers section
  { name: 'dev-apps', source: 'user-guide/integrations/plug.png' },
  { name: 'dev-api', source: 'user-guide/api/api-overview.png' },
  { name: 'dev-self-host', source: 'user-guide/what-is-twenty/20.png' },
  { name: 'dev-contribute', source: 'user-guide/github/github-header.png' },
];

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent('<html><body></body></html>');

  console.log(
    `Converting ${ILLUSTRATIONS.length} illustrations to halftone...\n`,
  );

  for (const illust of ILLUSTRATIONS) {
    const sourcePath = resolve(DOCS_IMAGES, illust.source);
    console.log(`  ${illust.name} ← ${illust.source}`);

    const imageBytes = readFileSync(sourcePath);
    const base64 = imageBytes.toString('base64');
    const mime = sourcePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const resultBase64 = await page.evaluate(async ({ b64, m }) => {
      const LINE_SPACING = 8;
      const MIN_LINE_WIDTH = 0.5;
      const MAX_LINE_WIDTH = 6;
      const COLOR = { r: 74, g: 56, b: 245 }; // #4A38F5
      const TRANSPARENT_BG = true;

      const img = new Image();
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = `data:${m};base64,${b64}`;
      });

      const { width, height } = img;
      const scale = 2;
      const outW = width * scale;
      const outH = height * scale;

      // Read source pixels
      const tmp = document.createElement('canvas');
      tmp.width = width;
      tmp.height = height;
      const tmpCtx = tmp.getContext('2d');
      tmpCtx.drawImage(img, 0, 0);
      const px = tmpCtx.getImageData(0, 0, width, height).data;

      // Output canvas
      const out = document.createElement('canvas');
      out.width = outW;
      out.height = outH;
      const ctx = out.getContext('2d');
      // Transparent background — adapts to both light and dark mode

      const sp = LINE_SPACING * scale;

      for (let y = sp / 2; y < outH; y += sp) {
        const srcY = Math.min(Math.floor(y / scale), height - 1);
        let x = 0;

        while (x < outW) {
          const srcX = Math.min(Math.floor(x / scale), width - 1);
          const i = (srcY * width + srcX) * 4;
          const lum = (0.299 * px[i] + 0.587 * px[i+1] + 0.114 * px[i+2]) / 255;
          const a = px[i+3] / 255;
          const dark = (1 - lum) * a;

          if (dark > 0.2) {
            const w = (MIN_LINE_WIDTH + (MAX_LINE_WIDTH - MIN_LINE_WIDTH) * dark) * scale;
            const dashLen = sp * (0.3 + 0.7 * dark);
            const gap = sp * (0.1 + 0.4 * (1 - dark));
            const alpha = 0.3 + 0.7 * dark;

            ctx.strokeStyle = `rgba(${COLOR.r},${COLOR.g},${COLOR.b},${alpha})`;
            ctx.lineWidth = w;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(Math.min(x + dashLen, outW), y);
            ctx.stroke();
            x += dashLen + gap;
          } else {
            x += sp * 0.5;
          }
        }
      }

      return out.toDataURL('image/png').split(',')[1];
    }, { b64: base64, m: mime });

    const outputPath = join(OUTPUT_DIR, `${illust.name}.png`);
    writeFileSync(outputPath, Buffer.from(resultBase64, 'base64'));
    console.log(`    → ${outputPath}`);
  }

  await browser.close();
  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
