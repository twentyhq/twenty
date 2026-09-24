import { normalizePageLayoutTabManifest } from 'twenty-shared/application';

export const normalizePageLayoutTabManifestOrThrow = (
  args: Parameters<typeof normalizePageLayoutTabManifest>[0],
) => {
  const result = normalizePageLayoutTabManifest(args);

  if (result.status === 'fail') {
    throw new Error(result.errors.join('\n'));
  }

  return result.pageLayoutTab;
};
