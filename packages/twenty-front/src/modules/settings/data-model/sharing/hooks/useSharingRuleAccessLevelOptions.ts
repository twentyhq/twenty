import { useLingui } from '@lingui/react/macro';
import { type SelectOption } from 'twenty-ui/input';

import { SharingRuleAccessLevel } from '~/generated-metadata/graphql';

export const useSharingRuleAccessLevelOptions =
  (): SelectOption<SharingRuleAccessLevel>[] => {
    const { t } = useLingui();

    return [
      { value: SharingRuleAccessLevel.READ, label: t`Can view` },
      { value: SharingRuleAccessLevel.READ_WRITE, label: t`Can edit` },
    ];
  };
