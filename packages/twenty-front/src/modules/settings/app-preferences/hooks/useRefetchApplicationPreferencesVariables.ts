import { type useApplicationsWithPreferences } from '@/settings/app-preferences/hooks/useApplicationsWithPreferences';
import { getApplicationPreferencesVariablesCompleteness } from '@/settings/app-preferences/utils/getApplicationPreferencesVariablesCompleteness';

export const useRefetchApplicationPreferencesVariables = ({
  applicationId,
  refetchApplicationsWithPreferences,
}: {
  applicationId: string;
  refetchApplicationsWithPreferences: ReturnType<
    typeof useApplicationsWithPreferences
  >['refetch'];
}) => {
  const refetchApplicationVariables = async () => {
    const { data } = await refetchApplicationsWithPreferences();

    return getApplicationPreferencesVariablesCompleteness({
      applicationId,
      applicationPreferences: data?.myApplicationPreferences,
    });
  };

  return { refetchApplicationVariables };
};
