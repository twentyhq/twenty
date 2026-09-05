import { useLingui } from '@lingui/react/macro';

import { RecordShareRowCause } from '~/generated-metadata/graphql';

export const useRecordShareRowCauseLabel = () => {
  const { t } = useLingui();

  const getRecordShareRowCauseLabel = (rowCause: RecordShareRowCause) => {
    switch (rowCause) {
      case RecordShareRowCause.OWNER:
        return t`Owner`;
      case RecordShareRowCause.MANUAL:
        return t`Shared`;
      case RecordShareRowCause.RULE:
        return t`Rule`;
      case RecordShareRowCause.APPLICATION:
        return t`App`;
    }
  };

  return { getRecordShareRowCauseLabel };
};
