export const useMoveViewColumns = () => {
  const handleColumnMove = <T extends { position: number }>(
    direction: 'left' | 'right',
    currentArrayindex: number,
    targetArray: T[],
  ) => {
    const targetArrayIndex =
      direction === 'left' ? currentArrayindex - 1 : currentArrayindex + 1;
    const targetArraySize = targetArray.length - 1;
    if (
      currentArrayindex >= 0 &&
      targetArrayIndex >= 0 &&
      currentArrayindex <= targetArraySize &&
      targetArrayIndex <= targetArraySize
    ) {
      const currentEntity = targetArray[currentArrayindex];
      const targetEntity = targetArray[targetArrayIndex];
      const newArray = [...targetArray];

      newArray[currentArrayindex] = {
        ...targetEntity,
        index: currentEntity.position,
      };
      newArray[targetArrayIndex] = {
        ...currentEntity,
        index: targetEntity.position,
      };

      return newArray.map((column, index) => ({
        ...column,
        position: index,
      }));
    }

    return targetArray;
  };

  return { handleColumnMove };
};
