import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { DEFAULT_COMPANY_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultCompanyPageLayoutId';
import { DEFAULT_NOTE_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultNotePageLayoutId';
import { DEFAULT_OPPORTUNITY_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultOpportunityPageLayoutId';
import { DEFAULT_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultPageLayoutId';
import { DEFAULT_PERSON_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultPersonPageLayoutId';
import { DEFAULT_TASK_PAGE_LAYOUT_ID } from '@/page-layout/constants/DefaultTaskPageLayoutId';
import { type TargetRecordIdentifier } from '@/ui/layout/contexts/TargetRecordIdentifier';
import { isDefined } from 'twenty-shared/utils';

const OBJECT_NAME_TO_DEFAULT_LAYOUT_ID: Record<string, string> = {
  [CoreObjectNameSingular.Company]: DEFAULT_COMPANY_PAGE_LAYOUT_ID,
  [CoreObjectNameSingular.Person]: DEFAULT_PERSON_PAGE_LAYOUT_ID,
  [CoreObjectNameSingular.Opportunity]: DEFAULT_OPPORTUNITY_PAGE_LAYOUT_ID,
  [CoreObjectNameSingular.Note]: DEFAULT_NOTE_PAGE_LAYOUT_ID,
  [CoreObjectNameSingular.Task]: DEFAULT_TASK_PAGE_LAYOUT_ID,
};

export const useRecordPageLayoutId = ({
  id,
  targetObjectNameSingular,
}: TargetRecordIdentifier) => {
  const { record } = useFindOneRecord<ObjectRecord & { pageLayoutId?: string }>(
    {
      objectNameSingular: targetObjectNameSingular,
      objectRecordId: id,
    },
  );

  if (!isDefined(record)) {
    return {
      pageLayoutId: null,
    };
  }

  if (isDefined(record.pageLayoutId)) {
    return {
      pageLayoutId: record.pageLayoutId,
    };
  }

  // Map standard objects to their specific default layouts
  const defaultLayoutId =
    OBJECT_NAME_TO_DEFAULT_LAYOUT_ID[targetObjectNameSingular] ??
    DEFAULT_PAGE_LAYOUT_ID;

  return {
    pageLayoutId: defaultLayoutId,
  };
};
