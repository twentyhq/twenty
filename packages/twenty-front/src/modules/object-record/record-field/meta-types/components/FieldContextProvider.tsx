import {
  FieldContext,
  GenericFieldContextType,
} from '@/object-record/record-field/contexts/FieldContext';

type FieldContextProviderProps = {
  children: React.ReactNode;
  fieldDefinition: GenericFieldContextType['fieldDefinition'];
  recordId?: string;
};

export const FieldContextProvider = ({
  children,
  fieldDefinition,
  recordId,
}: FieldContextProviderProps) => {
  return (
    <FieldContext.Provider
      value={{
        recordId: recordId ?? '1',
        isLabelIdentifier: false,
        recoilScopeId: '1',
        hotkeyScope: 'hotkey-scope',
        fieldDefinition,
        useUpdateRecord: () => [() => undefined, {}],
      }}
    >
      {children}
    </FieldContext.Provider>
  );
};
