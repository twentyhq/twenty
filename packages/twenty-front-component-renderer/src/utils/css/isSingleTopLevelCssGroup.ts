export const isSingleTopLevelCssGroup = (cssCondition: string): boolean => {
  if (!cssCondition.startsWith('(') || !cssCondition.endsWith(')')) {
    return false;
  }

  let openGroupDepth = 0;

  for (let index = 0; index < cssCondition.length; index++) {
    const character = cssCondition.charAt(index);

    if (character === '(') {
      openGroupDepth += 1;
      continue;
    }

    if (character !== ')') {
      continue;
    }

    openGroupDepth -= 1;

    if (openGroupDepth === 0 && index < cssCondition.length - 1) {
      return false;
    }

    if (openGroupDepth < 0) {
      return false;
    }
  }

  return openGroupDepth === 0;
};
