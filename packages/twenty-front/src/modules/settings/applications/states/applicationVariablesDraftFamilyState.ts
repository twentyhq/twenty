import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';
import { type ApplicationVariableScope } from '~/generated-metadata/graphql';

export const applicationVariablesDraftFamilyState = createAtomFamilyState<
  Record<string, string>,
  { applicationId: string; scope: ApplicationVariableScope }
>({
  key: 'applicationVariablesDraftFamilyState',
  defaultValue: {},
});
