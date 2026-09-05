import { useLingui } from '@lingui/react/macro';
import { type SelectOption } from 'twenty-ui/input';

import { RecordShareAccessLevel } from '~/generated-metadata/graphql';

export const useRecordShareAccessLevelOptions =
  (): SelectOption<RecordShareAccessLevel>[] => {
    const { t } = useLingui();

    return [
      { value: RecordShareAccessLevel.READ, label: t`Can view` },
      { value: RecordShareAccessLevel.READ_WRITE, label: t`Can edit` },
      { value: RecordShareAccessLevel.FULL, label: t`Full access` },
    ];
  };
