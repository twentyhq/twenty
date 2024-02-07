import {
  FieldContext,
  GenericFieldContextType,
} from '@/object-record/record-field/contexts/FieldContext';

type FieldContextProviderProps = {
  children: React.ReactNode;
  fieldDefinition: GenericFieldContextType['fieldDefinition'];
  entityId?: string;
};

export const FieldContextProvider = ({
  children,
  fieldDefinition,
  entityId,
}: FieldContextProviderProps) => {
  return (
    <FieldContext.Provider
      value={{
        entityId: entityId ?? '1',
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
