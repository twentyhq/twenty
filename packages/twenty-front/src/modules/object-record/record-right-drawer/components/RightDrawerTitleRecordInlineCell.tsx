import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { usePersistField } from '@/object-record/record-field/hooks/usePersistField';
import { useRecordFieldInput } from '@/object-record/record-field/hooks/useRecordFieldInput';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { useListenRightDrawerClose } from '@/ui/layout/right-drawer/hooks/useListenRightDrawerClose';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';

// TODO: this should be better implemented if we refactor field input so that it's easier to implement logic like that
// Idea : maybe we could use draftValue instead of the newValue in the events
// Idea : we can remove all our listeners in the many input types and replace them with a onClose event that gives the event type
//   (tab, shift-tab, click-outside, escape, enter) and the newValue, that will reduce the boilerplate
//   and also the need to have our difficult to understand persist logic
//   the goal would be that we could easily call usePersistField anywhere under a FieldContext and it would work
export const RightDrawerTitleRecordInlineCell = () => {
  const { closeInlineCell } = useInlineCell();
  const persistField = usePersistField();

  const { recordId, fieldDefinition } = useContext(FieldContext);

  const { getDraftValueSelector } = useRecordFieldInput<unknown>(
    `${recordId}-${fieldDefinition.metadata.fieldName}`,
  );

  const draftValue = useRecoilValue(getDraftValueSelector());

  useListenRightDrawerClose(() => {
    persistField(draftValue);
    closeInlineCell();
  });

  return <RecordInlineCell />;
};
