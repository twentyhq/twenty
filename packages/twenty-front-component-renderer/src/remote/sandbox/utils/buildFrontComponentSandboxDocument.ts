import { FRONT_COMPONENT_SANDBOX_COURIER_SOURCE } from '@/remote/sandbox/generated/frontComponentSandboxCourierSource';

const escapeClosingScriptTag = (source: string): string =>
  source.split('</script>').join('<\\/script>');

export const buildFrontComponentSandboxDocument = (): string => {
  if (FRONT_COMPONENT_SANDBOX_COURIER_SOURCE.length === 0) {
    throw new Error(
      'Front component sandbox courier bundle is missing. Run the sandbox prebuild.',
    );
  }

  return [
    '<!doctype html>',
    '<html>',
    '<head><meta charset="utf-8" /></head>',
    '<body>',
    `<script>${escapeClosingScriptTag(FRONT_COMPONENT_SANDBOX_COURIER_SOURCE)}</script>`,
    '</body>',
    '</html>',
  ].join('');
};
