import { useIsFieldEmpty } from '@/object-record/record-field/hooks/useIsFieldEmpty';

import { RecordTableCellDisplayContainer } from './RecordTableCellDisplayContainer';

export const RecordTableCellDisplayMode = ({
  children,
  softFocus,
}: React.PropsWithChildren<{ softFocus?: boolean }>) => {
  const isEmpty = useIsFieldEmpty();

  if (isEmpty) {
    return <></>;
  }

  return (
    <RecordTableCellDisplayContainer softFocus={softFocus}>
      {children}
    </RecordTableCellDisplayContainer>
  );
};
