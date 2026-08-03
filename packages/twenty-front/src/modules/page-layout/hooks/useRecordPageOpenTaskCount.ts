import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { PageLayoutType } from '~/generated-metadata/graphql';

// Read straight off the record rather than counting tasks client side, so the
// tab can never disagree with the Open tasks filter on the People index.
export const useRecordPageOpenTaskCount = (): number | undefined => {
  const { targetRecordIdentifier, layoutType } = useLayoutRenderingContext();

  const recordStore = useAtomFamilyStateValue(
    recordStoreFamilyState,
    targetRecordIdentifier?.id ?? '',
  );

  const isPersonRecordPage =
    layoutType === PageLayoutType.RECORD_PAGE &&
    targetRecordIdentifier?.targetObjectNameSingular ===
      CoreObjectNameSingular.Person;

  if (!isPersonRecordPage) {
    return undefined;
  }

  const openTaskCount = recordStore?.openTaskCount;

  return typeof openTaskCount === 'number' ? openTaskCount : undefined;
};
