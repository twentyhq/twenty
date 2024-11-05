import { NivoLineInput } from '@/analytics/types/NivoLineInput';
//DOING: Adding the servelessFunctionDurationGraph to twenty
export const mapServerlessFunctionDurationToNivoLineInput = (
  serverlessFunctionDurationResult: {
    start: string;
    minimum: number;
    maximum: number;
    average: number;
  }[],
): NivoLineInput[] => {
  return serverlessFunctionDurationResult
    .flatMap((dataRow) => [
      {
        x: new Date(dataRow.start),
        y: dataRow.maximum,
        id: 'Maximum',
      },
      {
        x: new Date(dataRow.start),
        y: dataRow.minimum,
        id: 'Minimum',
      },
      {
        x: new Date(dataRow.start),
        y: dataRow.average,
        id: 'Average',
      },
    ])
    .reduce(
      (
        acc: NivoLineInput[],
        { id, x, y }: { id: string; x: Date; y: number },
      ) => {
        const existingGroupIndex = acc.findIndex((group) => group.id === id);
        const isExistingGroup = existingGroupIndex !== -1;

        if (isExistingGroup) {
          return acc.map((group, index) =>
            index === existingGroupIndex
              ? { ...group, data: [...group.data, { x, y }] }
              : group,
          );
        } else {
          return [...acc, { id, data: [{ x, y }] }];
        }
      },
      [],
    );
};
