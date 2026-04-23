import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum ChartDataExceptionCode {
  WIDGET_NOT_FOUND = 'WIDGET_NOT_FOUND',
  INVALID_WIDGET_CONFIGURATION = 'INVALID_WIDGET_CONFIGURATION',
  OBJECT_METADATA_NOT_FOUND = 'OBJECT_METADATA_NOT_FOUND',
  FIELD_METADATA_NOT_FOUND = 'FIELD_METADATA_NOT_FOUND',
  QUERY_EXECUTION_FAILED = 'QUERY_EXECUTION_FAILED',
  TRANSFORMATION_FAILED = 'TRANSFORMATION_FAILED',
}

const getChartDataExceptionUserFriendlyMessage = (
  code: ChartDataExceptionCode,
): MessageDescriptor => {
  switch (code) {
    case ChartDataExceptionCode.WIDGET_NOT_FOUND:
      return msg`Widget not found.`;
    case ChartDataExceptionCode.INVALID_WIDGET_CONFIGURATION:
      return msg`Invalid widget configuration.`;
    case ChartDataExceptionCode.OBJECT_METADATA_NOT_FOUND:
      return msg`Object metadata not found.`;
    case ChartDataExceptionCode.FIELD_METADATA_NOT_FOUND:
      return msg`Field metadata not found.`;
    case ChartDataExceptionCode.QUERY_EXECUTION_FAILED:
      return msg`Query execution failed.`;
    case ChartDataExceptionCode.TRANSFORMATION_FAILED:
      return msg`Transformation failed.`;
    default:
      assertUnreachable(code);
  }
};

export class ChartDataException extends CustomException<ChartDataExceptionCode> {
  constructor(
    message: string,
    code: ChartDataExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? getChartDataExceptionUserFriendlyMessage(code),
    });
  }
}

export const generateChartDataExceptionMessage = (
  code: ChartDataExceptionCode,
  context?: string,
): string => {
  const messages: Record<ChartDataExceptionCode, string> = {
    [ChartDataExceptionCode.WIDGET_NOT_FOUND]: `Widget not found${context ? `: ${context}` : ''}`,
    [ChartDataExceptionCode.INVALID_WIDGET_CONFIGURATION]: `Invalid widget configuration${context ? `: ${context}` : ''}`,
    [ChartDataExceptionCode.OBJECT_METADATA_NOT_FOUND]: `Object metadata not found${context ? `: ${context}` : ''}`,
    [ChartDataExceptionCode.FIELD_METADATA_NOT_FOUND]: `Field metadata not found${context ? `: ${context}` : ''}`,
    [ChartDataExceptionCode.QUERY_EXECUTION_FAILED]: `Query execution failed${context ? `: ${context}` : ''}`,
    [ChartDataExceptionCode.TRANSFORMATION_FAILED]: `Transformation failed${context ? `: ${context}` : ''}`,
  };

  return messages[code];
};
