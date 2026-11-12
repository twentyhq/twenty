import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isRecordIndexTabsSupportedForViewType } from '@/object-record/record-index-tab/utils/isRecordIndexTabsSupportedForViewType';
import { recordIndexTabFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexTabFieldMetadataItemComponentState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { checkIfFeatureFlagIsEnabledOnWorkspace } from '@/workspace/utils/checkIfFeatureFlagIsEnabledOnWorkspace';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isRecordIndexTabsDisplayedComponentSelector =
  createAtomComponentSelector<boolean>({
    key: 'isRecordIndexTabsDisplayedComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) =>
        checkIfFeatureFlagIsEnabledOnWorkspace(
          FeatureFlagKey.IS_RECORD_GROUP_TABS_ENABLED,
          get(currentWorkspaceState),
        ) &&
        isDefined(
          get(recordIndexTabFieldMetadataItemComponentState, { instanceId }),
        ) &&
        isRecordIndexTabsSupportedForViewType(
          get(recordIndexViewTypeState, { instanceId }),
        ),
  });
