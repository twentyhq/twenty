import { FieldInputEventContextProvider } from '@/object-record/record-field/ui/components/FieldInputEventContextProvider';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';

type FieldWidgetInputContextProviderProps = {
  children: React.ReactNode;
};

export const FieldWidgetInputContextProvider = ({
  children,
}: FieldWidgetInputContextProviderProps) => {
  const { closeInlineCell } = useInlineCell();

  return (
    <FieldInputEventContextProvider onClose={closeInlineCell}>
      {children}
    </FieldInputEventContextProvider>
  );
};
