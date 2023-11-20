import {
  FieldContext,
  GenericFieldContextType,
} from '@/ui/object/field/contexts/FieldContext';

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
        isMainIdentifier: false,
        recoilScopeId: '1',
        hotkeyScope: 'hotkey-scope',
        fieldDefinition,
        useUpdateEntityMutation: () => [() => undefined, {}],
      }}
    >
      {children}
    </FieldContext.Provider>
  );
};
