import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useColorScheme } from '@/ui/theme/hooks/useColorScheme';
import { SettingsPath } from 'twenty-shared/types';
import { useRecoilState } from 'recoil';
import { dateTimeFormatState } from '@/localization/states/dateTimeFormatState';
import { Trans, useLingui } from '@lingui/react/macro';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { ColorSchemePicker } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { WorkspaceMemberNumberFormatEnum } from '~/generated/graphql';
import { NumberFormat } from '@/localization/constants/NumberFormat';
import { detectNumberFormat } from '@/localization/utils/detectNumberFormat';
import { DateTimeSettings } from '~/pages/settings/profile/appearance/components/DateTimeSettings';
import { LocalePicker } from '~/pages/settings/profile/appearance/components/LocalePicker';
import { NumberFormatSelect } from '~/pages/settings/profile/appearance/components/NumberFormatSettings';
import { logError } from '~/utils/logError';

export const SettingsExperience = () => {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [dateTimeFormat, setDateTimeFormat] =
    useRecoilState(dateTimeFormatState);

  const { t } = useLingui();

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const handleNumberFormatChange = async (value: NumberFormat) => {
    if (!currentWorkspaceMember?.id) {
      logError('User is not logged in');
      return;
    }

    const workspaceNumberFormat =
      value === NumberFormat.SYSTEM
        ? WorkspaceMemberNumberFormatEnum.SYSTEM
        : (value as unknown as WorkspaceMemberNumberFormatEnum);

    try {
      await updateOneRecord({
        idToUpdate: currentWorkspaceMember.id,
        updateOneRecordInput: {
          numberFormat: workspaceNumberFormat,
        },
      });

      setCurrentWorkspaceMember({
        ...currentWorkspaceMember,
        numberFormat: workspaceNumberFormat,
      });

      setDateTimeFormat((prev) => ({
        ...prev,
        numberFormat:
          value === NumberFormat.SYSTEM
            ? (detectNumberFormat() as NumberFormat)
            : value,
      }));
    } catch (error) {
      logError(error);
    }
  };

  return (
    <SubMenuTopBarContainer
      title={t`Experience`}
      links={[
        {
          children: <Trans>User</Trans>,
          href: getSettingsPath(SettingsPath.ProfilePage),
        },
        { children: <Trans>Experience</Trans> },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title={t`Appearance`} />
          <ColorSchemePicker
            value={colorScheme}
            onChange={setColorScheme}
            lightLabel={t`Light`}
            darkLabel={t`Dark`}
            systemLabel={t`System settings`}
          />
        </Section>

        <Section>
          <H2Title
            title={t`Language`}
            description={t`Select your preferred language`}
          />
          <LocalePicker />
        </Section>

        <Section>
          <H2Title
            title={t`Date and time`}
            description={t`Configure how dates are displayed across the app`}
          />
          <DateTimeSettings />
        </Section>

        <Section>
          <H2Title
            title={t`Other format`}
            description={t`Choose additional formatting preferences`}
          />
          <NumberFormatSelect
            value={dateTimeFormat.numberFormat}
            onChange={handleNumberFormatChange}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
