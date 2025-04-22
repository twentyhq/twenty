import { useTestServerlessFunction } from '@/serverless-functions/hooks/useTestServerlessFunction';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsServerlessFunctionCodeEditorTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionCodeEditorTab';
import { SettingsServerlessFunctionSettingsTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionSettingsTab';
import { SettingsServerlessFunctionTestTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTestTab';
import { useGetOneServerlessFunctionSourceCode } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunctionSourceCode';
import { usePublishOneServerlessFunction } from '@/settings/serverless-functions/hooks/usePublishOneServerlessFunction';
import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { useUpdateOneServerlessFunction } from '@/settings/serverless-functions/hooks/useUpdateOneServerlessFunction';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab/states/activeTabIdComponentState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { isDefined } from 'twenty-shared/utils';
import { IconCode, IconSettings, IconTestPipe } from 'twenty-ui/display';

const SERVERLESS_FUNCTION_DETAIL_ID = 'serverless-function-detail';

export const SettingsServerlessFunctionDetail = () => {
  const { serverlessFunctionId = '' } = useParams();
  const { enqueueSnackBar } = useSnackBar();
  const [activeTabId, setActiveTabId] = useRecoilComponentStateV2(
    activeTabIdComponentState,
    SERVERLESS_FUNCTION_DETAIL_ID,
  );
  const [isCodeValid, setIsCodeValid] = useState(true);
  const { updateOneServerlessFunction } =
    useUpdateOneServerlessFunction(serverlessFunctionId);
  const { publishOneServerlessFunction } = usePublishOneServerlessFunction();
  const { formValues, setFormValues, loading } =
    useServerlessFunctionUpdateFormState({ serverlessFunctionId });
  const { testServerlessFunction } = useTestServerlessFunction({
    serverlessFunctionId,
  });
  const { code: latestVersionCode } = useGetOneServerlessFunctionSourceCode({
    id: serverlessFunctionId,
    version: 'latest',
  });

  const handleSave = useDebouncedCallback(async () => {
    await updateOneServerlessFunction({
      name: formValues.name,
      description: formValues.description,
      code: formValues.code,
    });
  }, 1_000);

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
      code: { ...prevState.code, [filePath]: value },
    }));
    await handleSave();
  };

  const resetDisabled =
    !isDefined(latestVersionCode) ||
    isDeeplyEqual(latestVersionCode, formValues.code);
  const publishDisabled =
    !isCodeValid || isDeeplyEqual(latestVersionCode, formValues.code);

  const handleReset = async () => {
    try {
      const newState = {
        code: latestVersionCode || {},
      };
      setFormValues((prevState) => ({
        ...prevState,
        ...newState,
      }));
      await handleSave();
    } catch (err) {
      enqueueSnackBar(
        (err as Error)?.message || 'An error occurred while reset function',
        {
          variant: SnackBarVariant.Error,
        },
      );
    }
  };

  const handlePublish = async () => {
    try {
      await publishOneServerlessFunction({
        id: serverlessFunctionId,
      });
      enqueueSnackBar(`New function version has been published`, {
        variant: SnackBarVariant.Success,
      });
    } catch (err) {
      enqueueSnackBar(
        (err as Error)?.message ||
          'An error occurred while publishing new version',
        {
          variant: SnackBarVariant.Error,
        },
      );
    }
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
    ? Object.keys(formValues.code)
        .map((key) => {
          return {
            path: key,
            language: key === '.env' ? 'ini' : 'typescript',
            content: formValues.code?.[key] || '',
          };
        })
        .reverse()
    : [];

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case 'editor':
        return (
          <SettingsServerlessFunctionCodeEditorTab
            files={files}
            handleExecute={handleTestFunction}
            handlePublish={handlePublish}
            handleReset={handleReset}
            resetDisabled={resetDisabled}
            publishDisabled={publishDisabled}
            onChange={onCodeChange}
            setIsCodeValid={setIsCodeValid}
          />
        );
      case 'test':
        return (
          <SettingsServerlessFunctionTestTab
            serverlessFunctionId={serverlessFunctionId}
            handleExecute={handleTestFunction}
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
