import { useIsFieldEmpty } from '@/object-record/record-field/hooks/useIsFieldEmpty';

import { RecordTableCellDisplayContainer } from './RecordTableCellDisplayContainer';

export const RecordTableCellDisplayMode = ({
  children,
}: React.PropsWithChildren<unknown>) => {
  const isEmpty = useIsFieldEmpty();

  if (isEmpty) {
    return <></>;
  }

  return (
    <RecordTableCellDisplayContainer>
      {children}
    </RecordTableCellDisplayContainer>
  );
};
