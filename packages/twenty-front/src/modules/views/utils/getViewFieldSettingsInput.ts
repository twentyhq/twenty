import { type ViewFieldSettings } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type ViewFieldSettingsInput } from '~/generated-metadata/graphql';

export const getViewFieldSettingsInput = (
  settings: ViewFieldSettings | null | undefined,
): ViewFieldSettingsInput | null =>
  isDefined(settings)
    ? { label: settings.label, recordLimit: settings.recordLimit }
    : null;
