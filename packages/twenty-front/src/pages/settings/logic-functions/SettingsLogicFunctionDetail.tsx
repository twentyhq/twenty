import { useExecuteLogicFunction } from '@/logic-functions/hooks/useExecuteLogicFunction';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsLogicFunctionLabelContainer } from '@/settings/logic-functions/components/SettingsLogicFunctionLabelContainer';
import { SettingsLogicFunctionSettingsTab } from '@/settings/logic-functions/components/tabs/SettingsLogicFunctionSettingsTab';
import { SettingsLogicFunctionTestTab } from '@/settings/logic-functions/components/tabs/SettingsLogicFunctionTestTab';
import { SettingsLogicFunctionTriggersTab } from '@/settings/logic-functions/components/tabs/SettingsLogicFunctionTriggersTab';
import {
  type LogicFunctionFormValues,
  useLogicFunctionUpdateFormState,
} from '@/settings/logic-functions/hooks/useLogicFunctionUpdateFormState';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconBolt, IconPlayerPlay, IconSettings } from 'twenty-ui/display';
import { useFindOneApplicationQuery } from '~/generated-metadata/graphql';

const LOGIC_FUNCTION_DETAIL_ID = 'logic-function-detail';

export const SettingsLogicFunctionDetail = () => {
  const { logicFunctionId = '', applicationId = '' } = useParams();

  const { data, loading: applicationLoading } = useFindOneApplicationQuery({
    variables: { id: applicationId },
    skip: !applicationId,
  });

  const applicationName = data?.findOneApplication?.name;

  const instanceId = `${LOGIC_FUNCTION_DETAIL_ID}-${logicFunctionId}`;

  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    instanceId,
  );

  const { formValues, setFormValues, logicFunction, loading } =
    useLogicFunctionUpdateFormState({ logicFunctionId });

  const { executeLogicFunction, isExecuting } = useExecuteLogicFunction({
    logicFunctionId,
  });

  const handleExecute = async () => {
    await executeLogicFunction({ forceRebuild: true });
  };

  const onChange = (key: string) => {
    return (value: string) => {
      setFormValues((prevState: LogicFunctionFormValues) => ({
        ...prevState,
        [key]: value,
      }));
    };
  };

  const tabs = [
    { id: 'settings', title: t`Settings`, Icon: IconSettings },
    { id: 'test', title: t`Test`, Icon: IconPlayerPlay },
    { id: 'triggers', title: t`Triggers`, Icon: IconBolt },
  ];

  const isTriggersTab = activeTabId === 'triggers';
  const isSettingsTab = activeTabId === 'settings';
  const isTestTab = activeTabId === 'test';

  const breadcrumbLinks =
    isDefined(applicationId) && applicationId !== ''
      ? [
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: t`Applications`,
            href: getSettingsPath(SettingsPath.Applications),
          },
          {
            children: `${applicationName}`,
            href: getSettingsPath(
              SettingsPath.ApplicationDetail,
              {
                applicationId,
              },
              undefined,
              'content',
            ),
          },
          { children: `${logicFunction?.name}` },
        ]
      : [
          {
            children: t`Workspace`,
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: t`AI`,
            href: getSettingsPath(SettingsPath.AI),
          },
          { children: `${logicFunction?.name}` },
        ];

  return (
    !loading &&
    !applicationLoading && (
      <SubMenuTopBarContainer
        title={
          <SettingsLogicFunctionLabelContainer
            value={formValues.name}
            onChange={onChange('name')}
          />
        }
        links={breadcrumbLinks}
      >
        <SettingsPageContainer>
          <TabList tabs={tabs} componentInstanceId={instanceId} />
          {isTriggersTab && logicFunction && (
            <SettingsLogicFunctionTriggersTab logicFunction={logicFunction} />
          )}
          {isSettingsTab && (
            <SettingsLogicFunctionSettingsTab
              formValues={formValues}
              onChange={onChange}
            />
          )}
          {isTestTab && (
            <SettingsLogicFunctionTestTab
              handleExecute={handleExecute}
              logicFunctionId={logicFunctionId}
              isTesting={isExecuting}
            />
          )}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    )
  );
};
