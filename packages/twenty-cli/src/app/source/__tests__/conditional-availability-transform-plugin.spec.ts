import * as esbuild from 'esbuild';
import { expect, it } from 'vitest';
import { conditionalAvailabilityTransformPlugin } from '@/app/source/conditional-availability-transform-plugin';

it('allows other plugins to load virtual TypeScript modules', async () => {
  const result = await esbuild.build({
    stdin: { contents: "export { value } from 'generated.ts';" },
    bundle: true,
    format: 'esm',
    write: false,
    plugins: [
      conditionalAvailabilityTransformPlugin,
      {
        name: 'generated',
        setup(build) {
          build.onResolve({ filter: /^generated\.ts$/ }, () => ({
            path: 'generated.ts',
            namespace: 'generated',
          }));
          build.onLoad({ filter: /.*/, namespace: 'generated' }, () => ({
            contents: "export const value: string = 'generated';",
            loader: 'ts',
          }));
        },
      },
    ],
  });
  expect(result.outputFiles[0].text).toContain('generated');
});
