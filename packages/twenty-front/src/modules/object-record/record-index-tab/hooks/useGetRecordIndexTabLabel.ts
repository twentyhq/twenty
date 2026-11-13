import { type RecordIndexTab } from '@/object-record/record-index-tab/types/RecordIndexTab';
import { useLingui } from '@lingui/react/macro';

export const useGetRecordIndexTabLabel = () => {
  const { t } = useLingui();

  const getRecordIndexTabLabel = ({ kind, label }: RecordIndexTab) => {
    switch (kind) {
      case 'noValue':
        return t`No value`;
      case 'all':
        return t`All`;
      default:
        return label;
    }
  };

  return { getRecordIndexTabLabel };
};
