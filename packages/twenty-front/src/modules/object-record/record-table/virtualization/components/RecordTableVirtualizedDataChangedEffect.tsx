import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useResetVirtualizationBecauseDataChanged } from '@/object-record/record-table/virtualization/hooks/useResetVirtualizationBecauseDataChanged';
import { lastObjectOperationThatResettedVirtualizationComponentState } from '@/object-record/record-table/virtualization/states/lastObjectOperationThatResettedVirtualizationComponentState';
import { objectOperationsByObjectNameSingularFamilyState } from '@/object-record/states/objectOperationsByObjectNameSingularFamilyState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const RecordTableVirtualizedDataChangedEffect = () => {
  const { objectNameSingular } = useRecordTableContextOrThrow();

  const { resetVirtualizationBecauseDataChanged } =
    useResetVirtualizationBecauseDataChanged(objectNameSingular);

  const [
    lastObjectOperationThatResettedVirtualization,
    setLastObjectOperationThatResettedVirtualization,
  ] = useRecoilComponentState(
    lastObjectOperationThatResettedVirtualizationComponentState,
  );

  const objectOperationsForObjectNameSingular = useRecoilValue(
    objectOperationsByObjectNameSingularFamilyState({ objectNameSingular }),
  );

  useEffect(() => {
    const lastObjectOperation = objectOperationsForObjectNameSingular.at(-1);

    if (
      !isDefined(lastObjectOperationThatResettedVirtualization) &&
      !isDefined(lastObjectOperation)
    ) {
      return;
    }

    if (
      lastObjectOperation?.id !==
      lastObjectOperationThatResettedVirtualization?.id
    ) {
      setLastObjectOperationThatResettedVirtualization(lastObjectOperation);

      if (isDefined(lastObjectOperation)) {
        resetVirtualizationBecauseDataChanged(lastObjectOperation);
      }
    }
  }, [
    lastObjectOperationThatResettedVirtualization,
    objectOperationsForObjectNameSingular,
    setLastObjectOperationThatResettedVirtualization,
    resetVirtualizationBecauseDataChanged,
  ]);

  return <></>;
};
