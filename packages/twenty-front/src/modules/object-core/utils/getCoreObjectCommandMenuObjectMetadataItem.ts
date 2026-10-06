import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';

export const getCoreObjectCommandMenuObjectMetadataItem = (
  coreObjectNameSingular: string | undefined,
) =>
  coreObjectNameSingular === CoreObjectNameSingular.Workflow
    ? {
        nameSingular: CoreObjectNameSingular.Workflow,
        namePlural: CoreObjectNamePlural.Workflow,
        labelSingular: t`Workflow`,
        labelPlural: t`Workflows`,
        icon: 'IconSettingsAutomation',
      }
    : undefined;
