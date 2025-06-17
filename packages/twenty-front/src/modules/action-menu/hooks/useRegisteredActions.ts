import { RECORD_AGNOSTIC_ACTIONS_CONFIG } from '@/action-menu/actions/record-agnostic-actions/constants/RecordAgnosticActionsConfig';
import { ActionViewType } from '@/action-menu/actions/types/ActionViewType';
import { ShouldBeRegisteredFunctionParams } from '@/action-menu/actions/types/ShouldBeRegisteredFunctionParams';
import { getActionConfig } from '@/action-menu/actions/utils/getActionConfig';
import { getActionViewType } from '@/action-menu/actions/utils/getActionViewType';
import { companyPermissionsSelector } from '@/auth/states/objectPermissionsSelector.ts/companyPermissionsSelector';
import { notePermissionsSelector } from '@/auth/states/objectPermissionsSelector.ts/notePermissionsSelector';
import { opportunityPermissionsSelector } from '@/auth/states/objectPermissionsSelector.ts/opportunityPermissionsSelector';
import { personPermissionsSelector } from '@/auth/states/objectPermissionsSelector.ts/personPermissionsSelector';
import { taskPermissionsSelector } from '@/auth/states/objectPermissionsSelector.ts/taskPermissionsSelector';
import { workflowPermissionsSelector } from '@/auth/states/objectPermissionsSelector.ts/workflowPermissionsSelector';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useRegisteredActions = (
  shouldBeRegisteredParams: ShouldBeRegisteredFunctionParams,
) => {
  const { objectMetadataItem } = shouldBeRegisteredParams;

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreCurrentViewType = useRecoilComponentValueV2(
    contextStoreCurrentViewTypeComponentState,
  );

  const viewType = getActionViewType(
    contextStoreCurrentViewType,
    contextStoreTargetedRecordsRule,
  );

  const isPermissionsV2Enabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_PERMISSIONS_V2_ENABLED,
  );

  const notePermissions = useRecoilValue(notePermissionsSelector);
  const taskPermissions = useRecoilValue(taskPermissionsSelector);
  const companyPermissions = useRecoilValue(companyPermissionsSelector);
  const personPermissions = useRecoilValue(personPermissionsSelector);
  const opportunityPermissions = useRecoilValue(opportunityPermissionsSelector);
  const workflowPermissions = useRecoilValue(workflowPermissionsSelector);

  const recordActionConfig = getActionConfig({
    objectMetadataItem,
    notePermissions: {
      canRead: isPermissionsV2Enabled ? notePermissions.canRead : true,
    },
    taskPermissions: {
      canRead: isPermissionsV2Enabled ? taskPermissions.canRead : true,
    },
    companyPermissions: {
      canRead: isPermissionsV2Enabled ? companyPermissions.canRead : true,
    },
    personPermissions: {
      canRead: isPermissionsV2Enabled ? personPermissions.canRead : true,
    },
    opportunityPermissions: {
      canRead: isPermissionsV2Enabled ? opportunityPermissions.canRead : true,
    },
    workflowPermissions: {
      canRead: isPermissionsV2Enabled ? workflowPermissions.canRead : true,
    },
  });

  const recordAgnosticActionConfig = RECORD_AGNOSTIC_ACTIONS_CONFIG;

  const actionsConfig = {
    ...recordActionConfig,
    ...recordAgnosticActionConfig,
  };

  const actionsToRegister = isDefined(viewType)
    ? Object.values(actionsConfig).filter(
        (action) =>
          action.availableOn?.includes(viewType) ||
          action.availableOn?.includes(ActionViewType.GLOBAL),
      )
    : [];

  const actions = actionsToRegister
    .filter((action) => action.shouldBeRegistered(shouldBeRegisteredParams))
    .sort((a, b) => a.position - b.position);

  return actions;
};
