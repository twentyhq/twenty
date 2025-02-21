import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { checkIfFeatureFlagIsEnabledOnWorkspace } from '@/workspace/utils/checkIfFeatureFlagIsEnabledOnWorkspace';
import { selector } from 'recoil';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const recordIndexOpenRecordInSelector = selector<ViewOpenRecordInType>({
  key: 'recordIndexOpenRecordInSelector',
  get: ({ get }) => {
    const currentWorkspace = get(currentWorkspaceState);
    const isCommandMenuV2Enabled = checkIfFeatureFlagIsEnabledOnWorkspace(
      FeatureFlagKey.IsCommandMenuV2Enabled,
      currentWorkspace,
    );

    return isCommandMenuV2Enabled
      ? get(recordIndexOpenRecordInState)
      : ViewOpenRecordInType.RECORD_PAGE;
  },
});
