import { CustomException } from 'src/utils/custom-exception';

export class CommonDataCoercerException extends CustomException<CommonDataCoercerExceptionCode> {}

export enum CommonDataCoercerExceptionCode {
  INVALID_NUMBER = 'INVALID_NUMBER',
  INVALID_TEXT = 'INVALID_TEXT',
  INVALID_DATE_OR_DATE_TIME = 'INVALID_DATE_OR_DATE_TIME',
  INVALID_RAW_JSON = 'INVALID_RAW_JSON',
  INVALID_ARRAY = 'INVALID_ARRAY',
  INVALID_BOOLEAN = 'INVALID_BOOLEAN',
  INVALID_UUID = 'INVALID_UUID',
  INVALID_MULTI_SELECT = 'INVALID_MULTI_SELECT',
  INVALID_SELECT = 'INVALID_SELECT',
  INVALID_COMPOSITE_FIELD = 'INVALID_COMPOSITE_FIELD',
}
