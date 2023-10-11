import {
  FieldContext,
  GenericFieldContextType,
} from '@/ui/field/contexts/FieldContext';

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
        recoilScopeId: '1',
        hotkeyScope: 'hotkey-scope',
        fieldDefinition,
        useUpdateEntityMutation: () => [
          () => {
            return;
          },
          {},
        ],
      }}
    >
      {children}
    </FieldContext.Provider>
  );
};
