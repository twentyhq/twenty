import { type ViewFieldSettings } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { isNonEmptyString } from '@sniptt/guards';

export const computeViewFieldSettingsWithLabel = ({
  settings,
  label,
}: {
  settings: ViewFieldSettings | null | undefined;
  label: string;
}): ViewFieldSettings | null => {
  const trimmedLabel = label.trim();

  const nextSettings: ViewFieldSettings = {
    ...(isNonEmptyString(trimmedLabel) ? { label: trimmedLabel } : {}),
    ...(isDefined(settings?.recordLimit)
      ? { recordLimit: settings.recordLimit }
      : {}),
  };

  return Object.keys(nextSettings).length > 0 ? nextSettings : null;
};
