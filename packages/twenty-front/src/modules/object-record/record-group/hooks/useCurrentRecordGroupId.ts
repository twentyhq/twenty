/* eslint-disable no-redeclare */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { useContext } from 'react';
import { isDefined } from '~/utils/isDefined';

type UseCurrentRecordGroupIdOptions = {
  allowUndefined?: boolean;
};

export function useCurrentRecordGroupId(): string;
export function useCurrentRecordGroupId(options?: {
  allowUndefined: true;
}): string | undefined;
export function useCurrentRecordGroupId(options?: {
  allowUndefined?: false;
}): string;

export function useCurrentRecordGroupId(
  options?: UseCurrentRecordGroupIdOptions,
): string | undefined {
  const context = useContext(RecordGroupContext);

  if (!context && !isDefined(options?.allowUndefined)) {
    throw new Error(
      'useCurrentRecordGroupId must be used within a RecordGroupContextProvider.',
    );
  }

  if (!context.recordGroupId && !isDefined(options?.allowUndefined)) {
    throw new Error(
      'RecordGroupContext is malformed. recordGroupId is missing.',
    );
  }

  return context.recordGroupId;
}
