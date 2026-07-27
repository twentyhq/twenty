const URL_FUNCTION_NAME_PATTERN = /url$/i;

const isOpeningUrlFunction = (declarationBeforeParenthesis: string): boolean =>
  URL_FUNCTION_NAME_PATTERN.test(declarationBeforeParenthesis);

export const splitCssDeclarations = (cssText: string): string[] => {
  const declarations: string[] = [];

  let currentDeclaration = '';
  let quoteCharacter: string | null = null;
  let isEscaped = false;
  let isInComment = false;
  let parenthesisDepth = 0;
  let urlTokenParenthesisDepth: number | null = null;

  for (let index = 0; index < cssText.length; index += 1) {
    const character = cssText[index];

    if (isInComment) {
      if (character === '*' && cssText[index + 1] === '/') {
        index += 1;
        isInComment = false;
      }
      continue;
    }

    if (quoteCharacter !== null) {
      currentDeclaration += character;

      if (isEscaped) {
        isEscaped = false;
      } else if (character === '\\') {
        isEscaped = true;
      } else if (character === quoteCharacter) {
        quoteCharacter = null;
      }
      continue;
    }

    if (
      urlTokenParenthesisDepth === null &&
      character === '/' &&
      cssText[index + 1] === '*'
    ) {
      currentDeclaration += ' ';
      index += 1;
      isInComment = true;
      continue;
    }

    if (character === '"' || character === "'") {
      quoteCharacter = character;
      currentDeclaration += character;
      continue;
    }

    if (character === '(') {
      parenthesisDepth += 1;

      if (
        urlTokenParenthesisDepth === null &&
        isOpeningUrlFunction(currentDeclaration)
      ) {
        urlTokenParenthesisDepth = parenthesisDepth;
      }

      currentDeclaration += character;
      continue;
    }

    if (character === ')') {
      if (
        urlTokenParenthesisDepth !== null &&
        parenthesisDepth <= urlTokenParenthesisDepth
      ) {
        urlTokenParenthesisDepth = null;
      }

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
