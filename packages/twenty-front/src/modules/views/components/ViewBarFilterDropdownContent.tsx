import { objectFilterDropdownAnyFieldSearchIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownAnyFieldSearchIsSelectedComponentState';
import { objectFilterDropdownFilterIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownFilterIsSelectedComponentState';
import { objectFilterDropdownIsSelectingRelationTargetFieldComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownIsSelectingRelationTargetFieldComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewBarFilterDropdownAnyFieldSearchInput } from '@/views/components/ViewBarFilterDropdownAnyFieldSearchInput';
import { ViewBarFilterDropdownFieldSelectMenu } from '@/views/components/ViewBarFilterDropdownFieldSelectMenu';
import { ViewBarFilterDropdownFilterInput } from '@/views/components/ViewBarFilterDropdownFilterInput';
import { ViewBarFilterDropdownRelationTargetFieldSelectMenu } from '@/views/components/ViewBarFilterDropdownRelationTargetFieldSelectMenu';
import { ViewBarFilterDropdownIds } from '@/views/constants/ViewBarFilterDropdownIds';

export const ViewBarFilterDropdownContent = () => {
  const [objectFilterDropdownFilterIsSelected] = useAtomComponentState(
    objectFilterDropdownFilterIsSelectedComponentState,
    ViewBarFilterDropdownIds.MAIN,
  );

  const objectFilterDropdownAnyFieldSearchIsSelected =
    useAtomComponentStateValue(
      objectFilterDropdownAnyFieldSearchIsSelectedComponentState,
    );

  const objectFilterDropdownIsSelectingRelationTargetField =
    useAtomComponentStateValue(
      objectFilterDropdownIsSelectingRelationTargetFieldComponentState,
    );

  const isAnyFieldSearchFilter = objectFilterDropdownAnyFieldSearchIsSelected;

  if (isAnyFieldSearchFilter) {
    return <ViewBarFilterDropdownAnyFieldSearchInput />;
  }

  if (objectFilterDropdownIsSelectingRelationTargetField) {
    return <ViewBarFilterDropdownRelationTargetFieldSelectMenu />;
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
