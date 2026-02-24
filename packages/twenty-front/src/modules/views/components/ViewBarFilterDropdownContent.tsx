import { objectFilterDropdownAnyFieldSearchIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownAnyFieldSearchIsSelectedComponentState';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { ViewBarFilterDropdownAnyFieldSearchInput } from '@/views/components/ViewBarFilterDropdownAnyFieldSearchInput';
import { ViewBarFilterDropdownFieldSelectMenu } from '@/views/components/ViewBarFilterDropdownFieldSelectMenu';
import { ViewBarFilterDropdownFilterInput } from '@/views/components/ViewBarFilterDropdownFilterInput';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';

export const ViewBarFilterDropdownContent = () => {
  const [objectFilterDropdownFilterIsSelected] = useRecoilComponentStateV2(
    objectFilterDropdownFilterIsSelectedComponentState,
    ViewBarFilterDropdownIds.MAIN,
  );

  const objectFilterDropdownAnyFieldSearchIsSelected =
    useRecoilComponentValueV2(
      objectFilterDropdownAnyFieldSearchIsSelectedComponentState,
    );

  const isAnyFieldSearchFilter = objectFilterDropdownAnyFieldSearchIsSelected;

  if (isAnyFieldSearchFilter) {
    return <ViewBarFilterDropdownAnyFieldSearchInput />;
  }

  const shouldShowFilterInput = objectFilterDropdownFilterIsSelected;

  return (
    <>
      {shouldShowFilterInput ? (
        <ViewBarFilterDropdownFilterInput />
      ) : (
        <ViewBarFilterDropdownFieldSelectMenu />
      )}
    </>
  );
};
