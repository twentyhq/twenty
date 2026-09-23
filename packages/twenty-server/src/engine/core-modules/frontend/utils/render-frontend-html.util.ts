import { type ClientConfig } from 'src/engine/core-modules/client-config/client-config.entity';

export const renderFrontendHtml = (
  template: string,
  clientConfig: ClientConfig,
): string => {
  // JSON is embedded in HTML, where even a non-executable script ends at </script>.
  const serializedConfig = JSON.stringify(clientConfig)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  return template
    .replace(
      /<!-- BEGIN: Twenty Config -->[\s\S]*?<!-- END: Twenty Config -->/,
      '<script id="twenty-env-config">window._env_ = {};</script>',
    )
    .replace(
      '</head>',
      () =>
        `<script id="twenty-client-config" type="application/json">${serializedConfig}</script></head>`,
    );
};
