import {
  FieldContext,
  GenericFieldContextType,
} from '@/ui/field/contexts/FieldContext';

type FieldDisplayContextProviderProps = {
  children: React.ReactNode;
  fieldDefinition: GenericFieldContextType['fieldDefinition'];
  entityId?: string;
};

export const FieldDisplayContextProvider = ({
  children,
  fieldDefinition,
  entityId,
}: FieldDisplayContextProviderProps) => {
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
