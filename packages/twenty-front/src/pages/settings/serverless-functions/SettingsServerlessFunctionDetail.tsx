import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsServerlessFunctionCodeEditorTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionCodeEditorTab';
import { SettingsServerlessFunctionSettingsTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionSettingsTab';
import { SettingsServerlessFunctionTestTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTestTab';
import { SettingsServerlessFunctionTestTabEffect } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTestTabEffect';
import { useExecuteOneServerlessFunction } from '@/settings/serverless-functions/hooks/useExecuteOneServerlessFunction';
import { useGetOneServerlessFunctionSourceCode } from '@/settings/serverless-functions/hooks/useGetOneServerlessFunctionSourceCode';
import { usePublishOneServerlessFunction } from '@/settings/serverless-functions/hooks/usePublishOneServerlessFunction';
import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { useUpdateOneServerlessFunction } from '@/settings/serverless-functions/hooks/useUpdateOneServerlessFunction';
import { settingsServerlessFunctionInputState } from '@/settings/serverless-functions/states/settingsServerlessFunctionInputState';
import { settingsServerlessFunctionOutputState } from '@/settings/serverless-functions/states/settingsServerlessFunctionOutputState';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { IconCode, IconSettings, IconTestPipe } from 'twenty-ui';
import { usePreventOverlapCallback } from '~/hooks/usePreventOverlapCallback';
import { isDefined } from '~/utils/isDefined';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

const TAB_LIST_COMPONENT_ID = 'serverless-function-detail';

export const SettingsServerlessFunctionDetail = () => {
  const { serverlessFunctionId = '' } = useParams();
  const { enqueueSnackBar } = useSnackBar();
  const { activeTabIdState, setActiveTabId } = useTabList(
    TAB_LIST_COMPONENT_ID,
  );
  const activeTabId = useRecoilValue(activeTabIdState);
  const [isCodeValid, setIsCodeValid] = useState(true);
  const { executeOneServerlessFunction } = useExecuteOneServerlessFunction();
  const { updateOneServerlessFunction } = useUpdateOneServerlessFunction();
  const { publishOneServerlessFunction } = usePublishOneServerlessFunction();
  const { formValues, setFormValues, loading } =
    useServerlessFunctionUpdateFormState(serverlessFunctionId);
  const { code: latestVersionCode } = useGetOneServerlessFunctionSourceCode({
    id: serverlessFunctionId,
    version: 'latest',
  });
  const setSettingsServerlessFunctionOutput = useSetRecoilState(
    settingsServerlessFunctionOutputState,
  );
  const settingsServerlessFunctionInput = useRecoilValue(
    settingsServerlessFunctionInputState,
  );

  const save = async () => {
    try {
      await updateOneServerlessFunction({
        id: serverlessFunctionId,
        name: formValues.name,
        description: formValues.description,
        code: formValues.code,
      });
    } catch (err) {
      enqueueSnackBar(
        (err as Error)?.message || 'An error occurred while updating function',
        {
          variant: SnackBarVariant.Error,
        },
      );
    }
  };

  const handleSave = usePreventOverlapCallback(save, 1000);

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

  const handleExecute = async () => {
    try {
      const result = await executeOneServerlessFunction({
        id: serverlessFunctionId,
        payload: JSON.parse(settingsServerlessFunctionInput),
        version: 'draft',
      });
      setSettingsServerlessFunctionOutput({
        data: result?.data?.executeOneServerlessFunction?.data
          ? JSON.stringify(
              result?.data?.executeOneServerlessFunction?.data,
              null,
              4,
            )
          : undefined,
        duration: result?.data?.executeOneServerlessFunction?.duration,
        status: result?.data?.executeOneServerlessFunction?.status,
        error: result?.data?.executeOneServerlessFunction?.error
          ? JSON.stringify(
              result?.data?.executeOneServerlessFunction?.error,
              null,
              4,
            )
          : undefined,
      });
    } catch (err) {
      enqueueSnackBar(
        (err as Error)?.message || 'An error occurred while executing function',
        {
          variant: SnackBarVariant.Error,
        },
      );
    }
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
            handleExecute={handleExecute}
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
          <>
            <SettingsServerlessFunctionTestTabEffect />
            <SettingsServerlessFunctionTestTab handleExecute={handleExecute} />
          </>
        );
      case 'settings':
        return (
          <SettingsServerlessFunctionSettingsTab
            formValues={formValues}
            serverlessFunctionId={serverlessFunctionId}
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
            href: getSettingsPagePath(SettingsPath.Workspace),
          },
          {
            children: 'Functions',
            href: getSettingsPagePath(SettingsPath.ServerlessFunctions),
          },
          { children: `${formValues.name}` },
        ]}
      >
        <SettingsPageContainer>
          <Section>
            <TabList tabListId={TAB_LIST_COMPONENT_ID} tabs={tabs} />
          </Section>
          {renderActiveTabContent()}
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    )
  );
};
