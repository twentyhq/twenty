import { type DeclarationOccurrence } from '../types/DeclarationOccurrence';

export const partitionFileExportsByType = (
  declarations: DeclarationOccurrence[],
) => {
  return declarations.reduce<{
    typeAndInterfaceDeclarations: DeclarationOccurrence[];
    otherDeclarations: DeclarationOccurrence[];
  }>(
    (accumulator, { kind, name }) => {
      if (kind === 'type' || kind === 'interface') {
        return {
          ...accumulator,
          typeAndInterfaceDeclarations: [
            ...accumulator.typeAndInterfaceDeclarations,
            { kind, name },
          ],
        };
      }

      return {
        ...accumulator,
        otherDeclarations: [...accumulator.otherDeclarations, { kind, name }],
      };
    },
    {
      typeAndInterfaceDeclarations: [],
      otherDeclarations: [],
    },
  );
};
