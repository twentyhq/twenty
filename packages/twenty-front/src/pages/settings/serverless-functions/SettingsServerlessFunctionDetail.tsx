import { useTestServerlessFunction } from '@/serverless-functions/hooks/useTestServerlessFunction';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsServerlessFunctionCodeEditorTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionCodeEditorTab';
import { SettingsServerlessFunctionSettingsTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionSettingsTab';
import { SettingsServerlessFunctionTestTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTestTab';
import { SettingsServerlessFunctionTriggersTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTriggersTab';
import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { useUpdateOneServerlessFunction } from '@/settings/serverless-functions/hooks/useUpdateOneServerlessFunction';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconCode,
  IconSettings,
  IconTestPipe,
  IconBolt,
} from 'twenty-ui/display';
import { useDebouncedCallback } from 'use-debounce';
import { t } from '@lingui/core/macro';
import { useFindOneApplicationQuery } from '~/generated-metadata/graphql';
import { computeNewSources } from '@/serverless-functions/utils/computeNewSources';
import { flattenSources } from '@/serverless-functions/utils/flattenSources';

const SERVERLESS_FUNCTION_DETAIL_ID = 'serverless-function-detail';

export const SettingsServerlessFunctionDetail = () => {
  const { serverlessFunctionId = '', applicationId = '' } = useParams();

  const { data } = useFindOneApplicationQuery({
    variables: { id: applicationId },
    skip: !applicationId,
  });

  const applicationName = data?.findOneApplication?.name;

  const [activeTabId, setActiveTabId] = useRecoilComponentState(
    activeTabIdComponentState,
    SERVERLESS_FUNCTION_DETAIL_ID,
  );
  const { updateOneServerlessFunction } =
    useUpdateOneServerlessFunction(serverlessFunctionId);

  const { formValues, setFormValues, serverlessFunction, loading } =
    useServerlessFunctionUpdateFormState({ serverlessFunctionId });

  const { testServerlessFunction, isTesting } = useTestServerlessFunction({
    serverlessFunctionId,
  });

  const handleSave = useDebouncedCallback(async () => {
    await updateOneServerlessFunction({
      name: formValues.name,
      description: formValues.description,
      code: formValues.code,
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
    await testServerlessFunction();
    setActiveTabId('test');
  };

  const tabs = [
    { id: 'editor', title: 'Editor', Icon: IconCode },
    { id: 'triggers', title: 'Triggers', Icon: IconBolt },
    { id: 'test', title: 'Test', Icon: IconTestPipe },
    { id: 'settings', title: 'Settings', Icon: IconSettings },
  ];

  const flattenedCode = flattenSources(formValues.code);

  const files = flattenedCode
    .map((file) => {
      const language = file.path === '.env' ? 'ini' : 'typescript';

      return {
        path: file.path,
        language,
        content: file.content,
      };
    })
    .reverse();

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
            serverlessFunctionId={serverlessFunctionId}
            onChange={onChange}
            onCodeChange={onCodeChange}
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
          <TabList
            tabs={tabs}
            componentInstanceId={SERVERLESS_FUNCTION_DETAIL_ID}
          />
          {renderActiveTabContent()}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    )
  );
};
