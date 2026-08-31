import { objectFilterDropdownAnyFieldSearchIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownAnyFieldSearchIsSelectedComponentState';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewBarFilterDropdownAnyFieldSearchInput } from '@/views/components/ViewBarFilterDropdownAnyFieldSearchInput';
import { ViewBarFilterDropdownFieldSelectMenu } from '@/views/components/ViewBarFilterDropdownFieldSelectMenu';
import { ViewBarFilterDropdownFilterInput } from '@/views/components/ViewBarFilterDropdownFilterInput';
import { useViewBarFilterDropdownIds } from '@/views/contexts/ViewBarFilterDropdownIdsContext';

export const ViewBarFilterDropdownContent = () => {
  const { mainDropdownId } = useViewBarFilterDropdownIds();

  const [objectFilterDropdownFilterIsSelected] = useAtomComponentState(
    objectFilterDropdownFilterIsSelectedComponentState,
    mainDropdownId,
  );

  const objectFilterDropdownAnyFieldSearchIsSelected =
    useAtomComponentStateValue(
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
