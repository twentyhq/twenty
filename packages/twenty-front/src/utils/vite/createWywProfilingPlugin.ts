/* eslint-disable no-console */
import { type Plugin } from 'vite';

const LINARIA_IMPORT_RE = /@linaria/;

type WywProfilingOptions = {
  slowThresholdMs?: number;
  topSlowFilesCount?: number;
  progressIntervalFiles?: number;
};

export const createWywProfilingPlugin = (
  wywPlugin: Plugin,
  options?: WywProfilingOptions,
): Plugin => {
  const slowThresholdMs = options?.slowThresholdMs ?? 50;
  const topSlowFilesCount = options?.topSlowFilesCount ?? 20;
  const progressIntervalFiles = options?.progressIntervalFiles ?? 50;

  let totalMs = 0;
  let fileCount = 0;
  let skippedCount = 0;
  const slowFiles: { id: string; ms: number }[] = [];
  const originalTransform = wywPlugin.transform;

  console.log(`[wyw] Profiling enabled (slow threshold: ${slowThresholdMs}ms)`);

  return {
    ...wywPlugin,
    enforce: 'pre' as const,
    transform(code: string, id: string, ...rest: unknown[]) {
      if (!LINARIA_IMPORT_RE.test(code)) {
        skippedCount++;
        return null;
      }

      const start = performance.now();
      const result = (originalTransform as Function).call(
        this,
        code,
        id,
        ...rest,
      );

      const handleTiming = (elapsed: number) => {
        totalMs += elapsed;
        fileCount++;

        if (elapsed > slowThresholdMs) {
          slowFiles.push({ id, ms: elapsed });
          console.log(
            `[wyw] slow: ${id.replace(process.cwd(), '')} ${elapsed.toFixed(0)}ms`,
          );
        }

        if (fileCount % progressIntervalFiles === 0) {
          console.log(
            `[wyw] progress: ${fileCount} transformed, ${skippedCount} skipped, ${totalMs.toFixed(0)}ms total`,
          );
        }
      };

      if (result && typeof result === 'object' && 'then' in result) {
        return (result as Promise<unknown>).then((res) => {
          handleTiming(performance.now() - start);
          return res;
        });
      }

      handleTiming(performance.now() - start);
      return result;
    },
    buildEnd() {
      console.log('\n[wyw] ===== TIMING SUMMARY =====');
      console.log(`[wyw] Files transformed: ${fileCount}`);
      console.log(`[wyw] Files skipped (no @linaria): ${skippedCount}`);
      console.log(`[wyw] Transform time: ${totalMs.toFixed(0)}ms`);
      console.log(
        `[wyw] Avg per transformed file: ${fileCount > 0 ? (totalMs / fileCount).toFixed(1) : 0}ms`,
      );

      if (slowFiles.length > 0) {
        console.log(`[wyw] Slow files (>${slowThresholdMs}ms):`);
        slowFiles
          .sort((a, b) => b.ms - a.ms)
          .slice(0, topSlowFilesCount)
          .forEach((f) =>
            console.log(
              `[wyw]   ${f.ms.toFixed(0)}ms ${f.id.replace(process.cwd(), '')}`,
            ),
          );
      }

      console.log('[wyw] ==============================\n');
    },
  };
};
