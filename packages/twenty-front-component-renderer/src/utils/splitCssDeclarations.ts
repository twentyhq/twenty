export const splitCssDeclarations = (cssText: string): string[] => {
  const declarations: string[] = [];

  let currentDeclaration = '';
  let quoteCharacter: string | null = null;
  let parenthesisDepth = 0;

  for (const character of cssText) {
    if (quoteCharacter !== null) {
      currentDeclaration += character;

      if (character === quoteCharacter) {
        quoteCharacter = null;
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quoteCharacter = character;
      currentDeclaration += character;
      continue;
    }

    if (character === '(') {
      parenthesisDepth += 1;
      currentDeclaration += character;
      continue;
    }

    if (character === ')') {
      parenthesisDepth = Math.max(0, parenthesisDepth - 1);
      currentDeclaration += character;
      continue;
    }

    if (character === ';' && parenthesisDepth === 0) {
      declarations.push(currentDeclaration);
      currentDeclaration = '';
      continue;
    }

    currentDeclaration += character;
  }

  declarations.push(currentDeclaration);

  return declarations;
};
