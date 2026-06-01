import { useNavigate, useParams } from 'react-router-dom';

import { useLogicFunctionForm } from '@/logic-functions/hooks/useLogicFunctionForm';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsLogicFunctionLabelContainer } from '@/settings/logic-functions/components/SettingsLogicFunctionLabelContainer';
import { SettingsLogicFunctionSettingsTab } from '@/settings/logic-functions/components/tabs/SettingsLogicFunctionSettingsTab';
import { SettingsLogicFunctionTestTab } from '@/settings/logic-functions/components/tabs/SettingsLogicFunctionTestTab';
import { SettingsLogicFunctionTriggersTab } from '@/settings/logic-functions/components/tabs/SettingsLogicFunctionTriggersTab';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import {
  IconBolt,
  IconCode,
  IconPlayerPlay,
  IconSettings,
} from 'twenty-ui/display';
import { useQuery } from '@apollo/client/react';
import { FindOneApplicationDocument } from '~/generated-metadata/graphql';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SettingsLogicFunctionCodeEditorTab } from '@/settings/logic-functions/components/tabs/SettingsLogicFunctionCodeEditorTab';
import { useExecuteLogicFunction } from '@/logic-functions/hooks/useExecuteLogicFunction';

const LOGIC_FUNCTION_DETAIL_ID = 'logic-function-detail';

export const SettingsLogicFunctionDetail = () => {
  const { logicFunctionId = '', applicationId } = useParams();

  const navigate = useNavigate();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const { data, loading: applicationLoading } = useQuery(
    FindOneApplicationDocument,
    {
      variables: { id: applicationId ?? '' },
      skip: !isDefined(applicationId),
    },
  );

  const applicationName = data?.findOneApplication?.name;

  const applicationVariableKeys =
    data?.findOneApplication?.applicationVariables?.map(
      (variable) => variable.key,
    ) ?? [];

  const workspaceCustomApplicationId =
    currentWorkspace?.workspaceCustomApplication?.id;

  const isReadonly =
    isDefined(applicationId) && applicationId !== workspaceCustomApplicationId;

  const instanceId = `${LOGIC_FUNCTION_DETAIL_ID}-${logicFunctionId}`;

  const activeTabId = useAtomComponentStateValue(
    activeTabIdComponentState,
    instanceId,
  );

  const { formValues, logicFunction, loading, onChange } = useLogicFunctionForm(
    { logicFunctionId },
  );

  const { executeLogicFunction, isExecuting } = useExecuteLogicFunction({
    logicFunctionId,
  });

  const handleTestFunction = async () => {
    navigate('#test');
    await executeLogicFunction();
  };

  const tabs = [
    {
      id: 'editor',
      title: t`Editor`,
      Icon: IconCode,
      disabled: isReadonly,
      hide: isReadonly,
    },
    { id: 'settings', title: t`Settings`, Icon: IconSettings },
    { id: 'test', title: t`Test`, Icon: IconPlayerPlay },
    { id: 'triggers', title: t`Triggers`, Icon: IconBolt },
  ];

  const isEditorTab = activeTabId === 'editor';
  const isTriggersTab = activeTabId === 'triggers';
  const isSettingsTab = activeTabId === 'settings';
  const isTestTab = activeTabId === 'test';

  const breadcrumbLinks = isDefined(applicationId)
    ? (() => {
        const applicationContentHref = getSettingsPath(
          SettingsPath.ApplicationDetail,
          { applicationId },
          undefined,
          'content',
        );
        return [
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: t`Applications`,
            href: getSettingsPath(SettingsPath.Applications),
          },
          { children: applicationName ?? '', href: applicationContentHref },
          { children: t`Logic functions`, href: applicationContentHref },
          { children: logicFunction?.name ?? '' },
        ];
      })()
    : [
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`AI`,
          href: getSettingsPath(SettingsPath.AI),
        },
        { children: t`Logic functions` },
        { children: logicFunction?.name ?? '' },
      ];

  const files = [
    {
      path: 'index.ts',
      content: formValues.sourceHandlerCode,
      language: 'typescript',
    },
  ];

  return (
    !loading &&
    !applicationLoading && (
      <SubMenuTopBarContainer
        title={
          <SettingsLogicFunctionLabelContainer
            value={formValues.name}
            onChange={onChange('name')}
            readonly={isReadonly}
          />
        }
        links={breadcrumbLinks}
      >
        <SettingsPageContainer>
          <TabList tabs={tabs} componentInstanceId={instanceId} />
          {isEditorTab && (
            <SettingsLogicFunctionCodeEditorTab
              files={files}
              handleExecute={handleTestFunction}
              onChange={onChange('sourceHandlerCode')}
              isTesting={isExecuting}
              applicationVariableKeys={applicationVariableKeys}
            />
          )}
          {isTriggersTab && (
            <SettingsLogicFunctionTriggersTab
              formValues={formValues}
              onChange={onChange}
              readonly={isReadonly}
              applicationName={applicationName}
            />
          )}
          {isSettingsTab && (
            <SettingsLogicFunctionSettingsTab
              formValues={formValues}
              onChange={onChange}
              readonly={isReadonly}
            />
          )}
          {isTestTab && (
            <SettingsLogicFunctionTestTab
              handleExecute={executeLogicFunction}
              logicFunctionId={logicFunctionId}
              formValues={formValues}
              isTesting={isExecuting}
            />
          )}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    )
  );
};
