import { useTestServerlessFunction } from '@/serverless-functions/hooks/useTestServerlessFunction';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsServerlessFunctionCodeEditorTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionCodeEditorTab';
import { SettingsServerlessFunctionSettingsTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionSettingsTab';
import { SettingsServerlessFunctionTestTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTestTab';
import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { useUpdateOneServerlessFunction } from '@/settings/serverless-functions/hooks/useUpdateOneServerlessFunction';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconCode, IconSettings, IconTestPipe } from 'twenty-ui/display';
import { useDebouncedCallback } from 'use-debounce';
import { SOURCE_FOLDER_NAME } from '@/serverless-functions/constants/SourceFolderName';

const SERVERLESS_FUNCTION_DETAIL_ID = 'serverless-function-detail';

export const SettingsServerlessFunctionDetail = () => {
  const { serverlessFunctionId = '' } = useParams();
  const [activeTabId, setActiveTabId] = useRecoilComponentState(
    activeTabIdComponentState,
    SERVERLESS_FUNCTION_DETAIL_ID,
  );
  const { updateOneServerlessFunction } =
    useUpdateOneServerlessFunction(serverlessFunctionId);

  const { formValues, setFormValues, loading } =
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
    setFormValues((prevState) => ({
      ...prevState,
      code: {
        ...prevState.code,
        [SOURCE_FOLDER_NAME]: {
          ...prevState.code[SOURCE_FOLDER_NAME],
          [filePath]: value,
        },
      },
    }));
    await handleSave();
  };

  const handleTestFunction = async () => {
    await testServerlessFunction();
    setActiveTabId('test');
  };

  const tabs = [
    { id: 'editor', title: 'Editor', Icon: IconCode },
    { id: 'test', title: 'Test', Icon: IconTestPipe },
    { id: 'settings', title: 'Settings', Icon: IconSettings },
  ];

  const files = formValues.code
    ? [
        {
          path: '.env',
          language: 'ini',
          content: formValues.code?.['.env'] || '',
        },
        ...Object.keys(formValues.code?.[SOURCE_FOLDER_NAME]).map((key) => {
          return {
            path: key,
            language: 'typescript',
            content: formValues.code?.[SOURCE_FOLDER_NAME]?.[key] || '',
          };
        }),
      ].reverse()
    : [];

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
            children: 'Functions',
            href: getSettingsPath(SettingsPath.ServerlessFunctions),
          },
          { children: `${formValues.name}` },
        ]}
      >
        <SettingsPageContainer>
          <TabList
            tabs={tabs}
            behaveAsLinks={false}
            componentInstanceId={SERVERLESS_FUNCTION_DETAIL_ID}
          />
          {renderActiveTabContent()}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    )
  );
};
