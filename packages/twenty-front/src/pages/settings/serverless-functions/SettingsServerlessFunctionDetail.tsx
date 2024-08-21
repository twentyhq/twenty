import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsServerlessFunctionCodeEditorTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionCodeEditorTab';
import { SettingsServerlessFunctionSettingsTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionSettingsTab';
import { SettingsServerlessFunctionTestTab } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTestTab';
import { SettingsServerlessFunctionTestTabEffect } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTestTabEffect';
import { useExecuteOneServerlessFunction } from '@/settings/serverless-functions/hooks/useExecuteOneServerlessFunction';
import { useServerlessFunctionUpdateFormState } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { useUpdateOneServerlessFunction } from '@/settings/serverless-functions/hooks/useUpdateOneServerlessFunction';
import { settingsServerlessFunctionInputState } from '@/settings/serverless-functions/states/settingsServerlessFunctionInputState';
import { settingsServerlessFunctionOutputState } from '@/settings/serverless-functions/states/settingsServerlessFunctionOutputState';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { TabList } from '@/ui/layout/tab/components/TabList';
import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useParams } from 'react-router-dom';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { IconCode, IconFunction, IconSettings, IconTestPipe } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';

const TAB_LIST_COMPONENT_ID = 'serverless-function-detail';

export const SettingsServerlessFunctionDetail = () => {
  const { serverlessFunctionId = '' } = useParams();
  const { enqueueSnackBar } = useSnackBar();
  const { activeTabIdState, setActiveTabId } = useTabList(
    TAB_LIST_COMPONENT_ID,
  );
  const activeTabId = useRecoilValue(activeTabIdState);
  const { executeOneServerlessFunction } = useExecuteOneServerlessFunction();
  const { updateOneServerlessFunction } = useUpdateOneServerlessFunction();
  const [formValues, setFormValues] =
    useServerlessFunctionUpdateFormState(serverlessFunctionId);
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

  const handleSave = useDebouncedCallback(save, 500);

  const onChange = (key: string) => {
    return async (value: string | undefined) => {
      setFormValues((prevState) => ({
        ...prevState,
        [key]: value,
      }));
      await handleSave();
    };
  };

  const handleExecute = async () => {
    await handleSave();
    try {
      const result = await executeOneServerlessFunction(
        serverlessFunctionId,
        JSON.parse(settingsServerlessFunctionInput),
      );
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

  const renderActiveTabContent = () => {
    switch (activeTabId) {
      case 'editor':
        return (
          <SettingsServerlessFunctionCodeEditorTab
            formValues={formValues}
            handleExecute={handleExecute}
            onChange={onChange}
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
    formValues.name && (
      <SubMenuTopBarContainer
        Icon={IconFunction}
        title={
          <Breadcrumb
            links={[
              { children: 'Functions', href: '/settings/functions' },
              { children: `${formValues.name}` },
            ]}
          />
        }
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
