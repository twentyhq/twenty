import { type AppPreferenceVariable } from '@/settings/app-preferences/types/AppPreferenceVariable';
import { isDefined } from 'twenty-shared/utils';

export const getAppPreferenceVariableUpdates = ({
  applicationVariables,
  draftValueByKey,
}: {
  applicationVariables: Pick<AppPreferenceVariable, 'key' | 'value'>[];
  draftValueByKey: Record<string, string>;
}): { key: string; value: string }[] =>
  applicationVariables.flatMap(({ key, value }) => {
    const draftValue = draftValueByKey[key];

    return isDefined(draftValue) && draftValue !== value
      ? [{ key, value: draftValue }]
      : [];
  });
