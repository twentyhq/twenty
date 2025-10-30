import { useTestServerlessFunction } from '@/serverless-functions/hooks/useTestServerlessFunction';
import { computeNewSources } from '@/serverless-functions/utils/computeNewSources';
import { flattenSources } from '@/serverless-functions/utils/flattenSources';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsServerlessFunctionCodeEditorTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionCodeEditorTab';
import { SettingsServerlessFunctionSettingsTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionSettingsTab';
import { SettingsServerlessFunctionTestTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTestTab';
import { SettingsServerlessFunctionTriggersTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTriggersTab';
import { usePersistServerlessFunction } from '@/settings/serverless-functions/hooks/usePersistServerlessFunction';
import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { useNavigate, useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconBolt,
  IconCode,
  IconSettings,
  IconTestPipe,
} from 'twenty-ui/display';
import { useDebouncedCallback } from 'use-debounce';
import { useFindOneApplicationQuery } from '~/generated-metadata/graphql';

const SERVERLESS_FUNCTION_DETAIL_ID = 'serverless-function-detail';

export const SettingsServerlessFunctionDetail = () => {
  const { serverlessFunctionId = '', applicationId = '' } = useParams();

  const navigate = useNavigate();

  const { data } = useFindOneApplicationQuery({
    variables: { id: applicationId },
    skip: !applicationId,
  });

  const applicationName = data?.findOneApplication?.name;

  const instanceId = `${SERVERLESS_FUNCTION_DETAIL_ID}-${serverlessFunctionId}`;

  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    instanceId,
  );
  const { updateServerlessFunction } = usePersistServerlessFunction();

  const { formValues, setFormValues, serverlessFunction, loading } =
    useServerlessFunctionUpdateFormState({ serverlessFunctionId });

  const { testServerlessFunction, isTesting } = useTestServerlessFunction({
    serverlessFunctionId,
  });

  const handleSave = useDebouncedCallback(async () => {
    await updateServerlessFunction({
      input: {
        id: serverlessFunctionId,
        update: {
          name: formValues.name,
          description: formValues.description,
          code: formValues.code,
        },
      },
    });
  }, 500);

  const onChange = (key: string) => {
    return async (value: string) => {
      setFormValues((prevState) => ({
        ...prevState,
        [key]: value,
      }));
      await handleSave();
    };
  };

  const onCodeChange = async (filePath: string, value: string) => {
    setFormValues((prevState) => {
      return {
        ...prevState,
        code: computeNewSources({
          previousCode: prevState['code'],
          filePath,
          value,
        }),
      };
    });
    await handleSave();
  };

  const handleTestFunction = async () => {
    navigate('#test');
    await testServerlessFunction();
  };

  const tabs = [
    { id: 'editor', title: 'Editor', Icon: IconCode },
    { id: 'triggers', title: 'Triggers', Icon: IconBolt },
    { id: 'test', title: 'Test', Icon: IconTestPipe },
    { id: 'settings', title: 'Settings', Icon: IconSettings },
  ];

  const flattenedCode = flattenSources(formValues.code);

  const files = flattenedCode
    .map((file) => ({
      path: file.path,
      language: 'typescript',
      content: file.content,
    }))
    .sort((a, b) =>
      a.path === serverlessFunction?.handlerPath
        ? -1
        : b.path === serverlessFunction?.handlerPath
          ? 1
          : 0,
    );

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case 'editor':
        return (
          <SettingsServerlessFunctionCodeEditorTab
            files={files}
            handleExecute={handleTestFunction}
            onChange={onCodeChange}
            isTesting={isTesting}
          />
        );
      case 'triggers':
        return serverlessFunction ? (
          <SettingsServerlessFunctionTriggersTab
            serverlessFunction={serverlessFunction}
          />
        ) : null;
      case 'test':
        return (
          <SettingsServerlessFunctionTestTab
            serverlessFunctionId={serverlessFunctionId}
            handleExecute={handleTestFunction}
            isTesting={isTesting}
          />
        );
      case 'settings':
        return (
          <SettingsServerlessFunctionSettingsTab
            formValues={formValues}
            onChange={onChange}
          />
        );
      default:
        return <></>;
    }
  };

  return (
    !loading && (
      <SubMenuTopBarContainer
        title={formValues.name}
        links={[
          {
            children: 'Workspace',
            href: getSettingsPath(SettingsPath.Workspace),
          },
          {
            children: t`Applications`,
            href: getSettingsPath(SettingsPath.Applications),
          },
          {
            children: `${applicationName}`,
            href: getSettingsPath(SettingsPath.ApplicationDetail, {
              applicationId,
            }),
          },
          { children: `${serverlessFunction?.name}` },
        ]}
      >
        <SettingsPageContainer>
          <TabList tabs={tabs} componentInstanceId={instanceId} />
          {renderActiveTabContent()}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    )
  );
};
