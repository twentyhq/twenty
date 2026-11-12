import { type StandalonePageLayoutWidgetManifest } from 'twenty-shared/application';

import { type LooseEnumValues } from '@/sdk/define/common/types/loose-enum-values.type';

export const validateStandalonePageLayoutWidgetPlacement = ({
  pageLayoutTabUniversalIdentifier,
  position,
}: Partial<
  Pick<
    LooseEnumValues<StandalonePageLayoutWidgetManifest>,
    'pageLayoutTabUniversalIdentifier' | 'position'
  >
>): string[] => {
  const errors: string[] = [];

  if (!pageLayoutTabUniversalIdentifier) {
    errors.push(
      'PageLayoutWidget must have a pageLayoutTabUniversalIdentifier when defined standalone (use the universalIdentifier of the tab it is added to)',
    );
  }

  if (!position) {
    errors.push(
      'PageLayoutWidget must have a position when defined standalone (its tab is not in the manifest, so the layout mode cannot be inferred)',
    );
  }

  return errors;
};
