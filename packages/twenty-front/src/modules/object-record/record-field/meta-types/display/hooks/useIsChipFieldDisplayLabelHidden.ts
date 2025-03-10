import { RecordTableCellContext } from '@/object-record/record-table/contexts/RecordTableCellContext';
import { isRecordTableScrolledLeftComponentState } from '@/object-record/record-table/states/isRecordTableScrolledLeftComponentState';
import { useComponentInstanceStateContext } from '@/ui/utilities/state/component-state/hooks/useComponentInstanceStateContext';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { globalComponentInstanceContextMap } from '@/ui/utilities/state/component-state/utils/globalComponentInstanceContextMap';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared';
import { useIsMobile } from 'twenty-ui';

export const useIsChipFieldDisplayLabelHidden = () => {
  const isMobile = useIsMobile();

  const instanceContext:
    | ComponentInstanceStateContext<{ instanceId: string }>
    | undefined = globalComponentInstanceContextMap.get(
    isRecordTableScrolledLeftComponentState.key,
  );

  const instanceStateContext =
    useComponentInstanceStateContext(instanceContext);

  const isChipFieldDisplayInRecordTable = isDefined(
    instanceStateContext?.instanceId,
  );

  const isRecordTableScrolledLeft = useRecoilComponentValueV2(
    isRecordTableScrolledLeftComponentState,
    instanceStateContext?.instanceId || 'EMPTY', // TODO: Ugly, find a better way to avoid throwing when instance state context is not found
  );

  const { columnDefinition } = useContext(RecordTableCellContext);

  const isLabelIdentifierInRecordTable = columnDefinition?.isLabelIdentifier;

  const isLabelHidden =
    isMobile &&
    isChipFieldDisplayInRecordTable &&
    !isRecordTableScrolledLeft &&
    isLabelIdentifierInRecordTable;

  return isLabelHidden;
};
