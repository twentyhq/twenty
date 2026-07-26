import { type TestInfo } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export type DemoClipMarks = {
  testStartedAt: number;
  testEndedAt: number;
  beginAt: number;
  endAt: number;
};

// Playwright records the whole test, so a demo video also contains the login,
// the navigation and every wait that only exists to reach the interesting part.
// The spec marks the section worth publishing and `trim-clips.ts` cuts the raw
// recording down to it afterwards, once the video file has been finalised.
// How long a spec should keep the page still after clip.end() so the recorder
// catches up before the context closes. trim-clips.ts uses the same value.
export const DEMO_CLIP_HOLD_SECONDS = 5;

export const createDemoClip = (testInfo: TestInfo) => {
  const testStartedAt = Date.now();
  let beginAt = testStartedAt;
  let endAt = testStartedAt;

  return {
    begin: () => {
      beginAt = Date.now();
    },
    end: () => {
      endAt = Date.now();
    },
    save: () => {
      const marks: DemoClipMarks = {
        testStartedAt,
        testEndedAt: Date.now(),
        beginAt,
        endAt,
      };

      fs.mkdirSync(testInfo.outputDir, { recursive: true });
      fs.writeFileSync(
        path.join(testInfo.outputDir, 'clip.json'),
        JSON.stringify(
          { slug: path.basename(testInfo.file).replace(/\.spec\.ts$/, ''), ...marks },
          null,
          2,
        ),
      );
    },
  };
};
