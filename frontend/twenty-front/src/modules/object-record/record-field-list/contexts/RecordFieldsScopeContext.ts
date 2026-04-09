import { createRequiredContext } from '~/utils/createRequiredContext';

export type RecordFieldsScopeContextValue = {
  scopeInstanceId: string;
};

export const [
  RecordFieldsScopeContextProvider,
  useRecordFieldsScopeContextOrThrow,
] = createRequiredContext<RecordFieldsScopeContextValue>(
  'RecordFieldsScopeContext',
);
