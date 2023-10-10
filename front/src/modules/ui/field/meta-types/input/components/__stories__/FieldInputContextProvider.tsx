import {
  FieldContext,
  GenericFieldContextType,
} from '@/ui/field/contexts/FieldContext';

type FieldInputContextProviderProps = {
  children: React.ReactNode;
  fieldDefinition: GenericFieldContextType['fieldDefinition'];
  entityId?: string;
  hotkeyScope: string;
};

export const FieldInputContextProvider = ({
  children,
  fieldDefinition,
  hotkeyScope,
  entityId,
}: FieldInputContextProviderProps) => {
  return (
    <FieldContext.Provider
      value={{
        entityId: entityId ?? '1',
        recoilScopeId: '1',
        hotkeyScope: hotkeyScope,
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
