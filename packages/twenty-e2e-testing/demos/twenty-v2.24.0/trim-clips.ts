import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { DEMO_CLIP_HOLD_SECONDS, type DemoClipMarks } from './lib/demoClip';

// Cuts each raw Playwright recording down to the section the spec marked with
// createDemoClip, then writes it to videos/<slug>.webm.
//
//   npx tsx demos/twenty-v2.24.0/trim-clips.ts

const RUN_RESULTS = path.resolve(__dirname, 'run_results');
const VIDEOS = path.resolve(__dirname, 'videos');

const LEAD_IN_SECONDS = 1;

// The screencast runs a few seconds behind wall clock on a busy page, so the
// marked end lands early in the recording. Specs hold the page still for
// DEMO_CLIP_HOLD_SECONDS after the end mark, and the same allowance is added
// here: whatever the lag turns out to be, the extra frames are static.
const TAIL_OUT_SECONDS = DEMO_CLIP_HOLD_SECONDS;

const resolveFfmpeg = () => {
  const browsersPath = process.env.PLAYWRIGHT_BROWSERS_PATH;

  if (browsersPath !== undefined && fs.existsSync(browsersPath)) {
    const bundled = fs
      .readdirSync(browsersPath)
      .filter((entry) => entry.startsWith('ffmpeg-'))
      .map((entry) => path.join(browsersPath, entry, 'ffmpeg-linux'))
      .find((candidate) => fs.existsSync(candidate));

    if (bundled !== undefined) {
      return bundled;
    }
  }

  return 'ffmpeg';
};

const ffmpeg = resolveFfmpeg();

fs.mkdirSync(VIDEOS, { recursive: true });

const runDirectories = fs.existsSync(RUN_RESULTS)
  ? fs.readdirSync(RUN_RESULTS)
  : [];

for (const runDirectory of runDirectories) {
  const directory = path.join(RUN_RESULTS, runDirectory);
  const clipPath = path.join(directory, 'clip.json');
  const videoPath = path.join(directory, 'video.webm');

  if (!fs.existsSync(clipPath) || !fs.existsSync(videoPath)) {
    continue;
  }

  const marks: DemoClipMarks & { slug: string } = JSON.parse(
    fs.readFileSync(clipPath, 'utf8'),
  );

  const start = (marks.beginAt - marks.testStartedAt) / 1000 - LEAD_IN_SECONDS;
  const duration =
    (marks.endAt - marks.beginAt) / 1000 + LEAD_IN_SECONDS + TAIL_OUT_SECONDS;

  const output = path.join(VIDEOS, `${marks.slug}.webm`);

  execFileSync(
    ffmpeg,
    [
      '-hide_banner',
      '-loglevel',
      'error',
      '-y',
      '-ss',
      Math.max(start, 0).toFixed(2),
      '-t',
      duration.toFixed(2),
      '-i',
      videoPath,
      '-c:v',
      'libvpx',
      '-b:v',
      '2M',
      output,
    ],
    { stdio: 'inherit' },
  );

  process.stdout.write(
    `${path.relative(process.cwd(), output)}  ${duration.toFixed(1)}s\n`,
  );
}
