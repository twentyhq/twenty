import { NivoLineInput } from '@/analytics/types/NivoLineInput';

export const mapServerlessFunctionErrorsToNivoLineInput = <
  T extends { start: string },
>(
  serverlessFunctionResult: (T & {
    error_count?: number;
    success_rate?: number;
  })[],
  type: 'ErrorCount' | 'SuccessRate',
): NivoLineInput[] => {
  return [
    {
      id: type === 'ErrorCount' ? 'Error' : 'Success Rate',
      data: serverlessFunctionResult.flatMap((dataRow) => [
        {
          x: new Date(dataRow.start),
          y:
            type === 'ErrorCount'
              ? (dataRow.error_count ?? 0)
              : (dataRow.success_rate ?? 0),
        },
      ]),
    },
  ];
};
